package utils

import "github.com/nabsk911/chronify/internal/db"

func MapDBEventToFrontend(dbEvent db.Event) map[string]any {
	return map[string]any{
		"id":                 dbEvent.ID,
		"title":              dbEvent.Title,
		"card_title":         dbEvent.CardTitle,
		"card_subtitle":      dbEvent.CardSubtitle.String,
		"card_detailed_text": dbEvent.CardDetailedText.String,
		"media": map[string]any{
			"name": dbEvent.MediaName.String,
			"type": dbEvent.MediaType.String,
			"source": map[string]string{
				"url": dbEvent.MediaUrl.String,
			},
		},
	}
}
