package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/nabsk911/chronify/internal/db"
	"github.com/nabsk911/chronify/internal/utils"
)

type MediaSource struct {
	URL string `json:"url"`
}

type Media struct {
	Name   string      `json:"name"`
	Type   string      `json:"type"`
	Source MediaSource `json:"source"`
}

type UpsertEventRequest struct {
	ID               *pgtype.UUID `json:"id,omitempty"`
	Title            string       `json:"title"`
	CardTitle        string       `json:"card_title"`
	CardSubtitle     pgtype.Text  `json:"card_subtitle"`
	CardDetailedText pgtype.Text  `json:"card_detailed_text"`
	Media            Media        `json:"media"`
}

type EventHandler struct {
	eventStore *db.Queries
	logger     *log.Logger
}

func NewEventHandler(eventStore *db.Queries, logger *log.Logger) *EventHandler {
	return &EventHandler{
		eventStore: eventStore,
		logger:     logger,
	}
}

func (eh *EventHandler) HandleGetEventsByTimelineId(w http.ResponseWriter, r *http.Request) {
	timelineID, err := utils.ReadIDParam(r, "timelineId")
	if err != nil {
		eh.logger.Printf("Invalid timeline ID: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"message": "Invalid timeline ID"})
		return
	}

	events, err := eh.eventStore.GetEventsByTimelineId(r.Context(), timelineID)
	if err != nil {
		eh.logger.Printf("Failed to retrieve events: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"message": "Failed to retrieve events"})
		return
	}
	var responseEvents []any
	for _, ev := range events {
		responseEvents = append(responseEvents, utils.MapDBEventToFrontend(ev))
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"events": responseEvents})
}

func (eh *EventHandler) HandleUpsertEvents(w http.ResponseWriter, r *http.Request) {
	timelineID, err := utils.ReadIDParam(r, "timelineId")
	if err != nil {
		eh.logger.Printf("Invalid timeline ID: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"message": "Invalid timeline ID"})
		return
	}

	userID, err := utils.ReadUserIDFromContext(r, "userID")
	if err != nil {
		eh.logger.Printf("Invalid user ID: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"message": "Invalid user ID"})
		return
	}

	timeline, err := eh.eventStore.GetTimeLineById(r.Context(), timelineID)
	if err != nil {
		eh.logger.Printf("Failed to retrieve timeline: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"message": "Failed to retrieve timeline"})
		return
	}

	if timeline.UserID != userID {
		eh.logger.Printf("Unauthorized access to timeline: %v", err)
		utils.WriteJSON(w, http.StatusUnauthorized, utils.Envelope{"message": "Unauthorized access to timeline"})
		return
	}

	var req []UpsertEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		eh.logger.Printf("Failed to decode request: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"message": "Invalid request payload"})
		return
	}

	res, err := eh.eventStore.GetMaxPositionByTimelineId(r.Context(), timelineID)

	if err != nil {
		eh.logger.Printf("Failed to get max position: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"message": "Failed to determine event position"})
		return
	}

	maxPos := int(res.(int32))

	if len(req) == 0 {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"message": "No events provided"})
		return
	}

	var createParams []db.BulkCreateEventsParams
	var updateParams []db.BulkUpdateEventsParams

	for _, e := range req {
		mediaURL := pgtype.Text{String: e.Media.Source.URL, Valid: e.Media.Source.URL != ""}
		mediaName := pgtype.Text{String: e.Media.Name, Valid: e.Media.Name != ""}
		mediaType := pgtype.Text{String: e.Media.Type, Valid: e.Media.Type != ""}
		if e.ID == nil || !e.ID.Valid {
			// New event → create
			maxPos++
			createParams = append(createParams, db.BulkCreateEventsParams{
				TimelineID:       timelineID,
				Title:            e.Title,
				CardTitle:        e.CardTitle,
				CardSubtitle:     e.CardSubtitle,
				CardDetailedText: e.CardDetailedText,
				MediaUrl:         mediaURL,
				MediaName:        mediaName,
				MediaType:        mediaType,
				Position: pgtype.Int4{
					Int32: int32(maxPos),
					Valid: true,
				},
			})
		} else {
			// Existing event → update
			updateParams = append(updateParams, db.BulkUpdateEventsParams{
				ID:               *e.ID,
				UserID:           userID,
				Title:            e.Title,
				CardTitle:        e.CardTitle,
				CardSubtitle:     e.CardSubtitle,
				CardDetailedText: e.CardDetailedText,
				MediaUrl:         mediaURL,
				MediaName:        mediaName,
				MediaType:        mediaType,
			})
		}
	}

	ctx := r.Context()

	// Bulk create new events
	if len(createParams) > 0 {
		_, err := eh.eventStore.BulkCreateEvents(ctx, createParams)
		if err != nil {
			eh.logger.Printf("Failed to create events: %v", err)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"message": "Failed to create events"})
			return
		}
	}

	// Bulk update existing events
	if len(updateParams) > 0 {
		results := eh.eventStore.BulkUpdateEvents(ctx, updateParams)
		defer results.Close()
		results.Exec(func(i int, err error) {
			if err != nil {
				eh.logger.Printf("Failed to update event: %v", err)
				utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"message": "Failed to update one or more events"})
				return
			}
		})
	}

	// Return full list for the timeline
	events, err := eh.eventStore.GetEventsByTimelineId(ctx, timelineID)
	if err != nil {
		eh.logger.Printf("Failed to retrieve events: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"message": "Failed to retrieve events"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"events": events})
}

func (eh *EventHandler) HandleDeleteEvent(w http.ResponseWriter, r *http.Request) {
	timelineID, err := utils.ReadIDParam(r, "timelineId")
	if err != nil {
		eh.logger.Printf("Invalid timeline ID: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"message": "Invalid timeline ID"})
		return
	}

	userID, err := utils.ReadUserIDFromContext(r, "userID")
	if err != nil {
		eh.logger.Printf("Invalid user ID: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"message": "Invalid user ID"})
		return
	}

	eventID, err := utils.ReadIDParam(r, "eventId")
	if err != nil {
		eh.logger.Printf("Invalid event ID: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"message": "Invalid event ID"})
		return
	}

	rowsAffected, err := eh.eventStore.DeleteEvent(r.Context(), db.DeleteEventParams{
		ID:     eventID,
		UserID: userID,
	})
	if err != nil {
		eh.logger.Printf("Failed to delete event: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"message": "Failed to delete event"})
		return
	}

	if rowsAffected == 0 {
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"message": "You're not allowed to delete this event"})
		return
	}

	events, err := eh.eventStore.GetEventsByTimelineId(r.Context(), timelineID)
	if err != nil {
		eh.logger.Printf("Failed to retrieve events: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"message": "Failed to retrieve events"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"message": "Event deleted successfully", "events": events})
}
