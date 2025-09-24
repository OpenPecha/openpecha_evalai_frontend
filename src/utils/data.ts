const ARENA_RANKINGS = [
    {
      "challenge_detail": {
        "challenge_name": "Tibetan to English Translation",
        "text": "བོད་ཡིག་གི་ཡི་གེ",
        "from_language": "bo",
        "to_language": "en"
      },
      "ranking": [
        {
          "template_name": "basic_translation",
          "model_name": "gpt-4o-mini",
          "elo_rating": 1520
        },
        {
          "template_name": "contextual_translation",
          "model_name": "gpt-5",
          "elo_rating": 1675
        }
      ]
    },
    {
      "challenge_detail": {
        "challenge_name": "French to German Translation",
        "text": "Bonjour, comment allez-vous?",
        "from_language": "fr",
        "to_language": "de"
      },
      "ranking": [
        {
          "template_name": "formal_style",
          "model_name": "mistral-7b",
          "elo_rating": 1450
        },
        {
          "template_name": "casual_style",
          "model_name": "gpt-4o",
          "elo_rating": 1605
        }
      ]
    },
    {
      "challenge_detail": {
        "challenge_name": "English to Japanese Translation",
        "text": "The mountain is beautiful in autumn.",
        "from_language": "en",
        "to_language": "ja"
      },
      "ranking": [
        {
          "template_name": "poetic_translation",
          "model_name": "claude-3",
          "elo_rating": 1490
        },
        {
          "template_name": "direct_translation",
          "model_name": "gpt-5",
          "elo_rating": 1710
        }
      ]
    }
  ]

  const CHALLENGE_RANKINGS = [
    {
      "challenge_detail": {
        "challenge_name": "Translation Challenge 1",
        "text": "བོད་ཡིག",
        "from_language": "bo",
        "to_language": "en"
      },
      "ranking": [
        {
          "template_name": "baseline_template",
          "model_name": null,
          "elo_rating": 1520.5
        },
        {
          "template_name": "advanced_template",
          "model_name": null,
          "elo_rating": 1487.2
        }
      ]
    },
    {
      "challenge_detail": {
        "challenge_name": "Translation Challenge 2",
        "text": "bonjour le monde",
        "from_language": "fr",
        "to_language": "en"
      },
      "ranking": [
        {
          "template_name": null,
          "model_name": "gpt-5",
          "elo_rating": 1623.4
        },
        {
          "template_name": null,
          "model_name": "llama-3-70b",
          "elo_rating": 1589.7
        }
      ]
    },
    {
      "challenge_detail": {
        "challenge_name": "Translation Challenge 3",
        "text": "hello world",
        "from_language": "en",
        "to_language": "de"
      },
      "ranking": [
        {
          "template_name": "contextual_template",
          "model_name": null,
          "elo_rating": 1710.2
        },
        {
          "template_name": "minimal_template",
          "model_name": null,
          "elo_rating": 1602.8
        }
      ]
    }
  ]

  const SAMPLE_UCCA = {
    "nodes": [
      {
        "id": "1",
        "name": "དེ་ནས་"
      },
      {
        "id": "2",
        "name": "ཡང་"
      },
      {
        "id": "3",
        "name": "བཅོམ་ལྡན་འདས་ཀྱིས་"
      },
      {
        "id": "4",
        "name": "འཁོར་བཞི་པོ་དེ་དག་"
      },
      {
        "id": "5",
        "name": "ཡང་དག་པར་"
      },
      {
        "id": "6",
        "name": "རབ་ཏུ་དགའ་བར་མཛད་པའི་ཕྱིར་"
      },
      {
        "id": "7",
        "name": "ཡང་"
      },
      {
        "id": "8",
        "name": "ཤེས་རབ་ཀྱི་ཕ་རོལ་ཏུ་ཕྱིན་པ་འདི་"
      },
      {
        "id": "9",
        "name": "སྟོན་ཅིང་"
      },
      {
        "id": "10",
        "name": "དེའི་ཚེ་"
      },
      {
        "id": "11",
        "name": "ཚིགས་སུ་བཅད་པ་འདི་དག་"
      },
      {
        "id": "12",
        "name": "བཀའ་སྩལ་ཏོ"
      }
    ],
    "edges": [
      {
        "source": "1",
        "target": "9",
        "relation": "Time"
      },
      {
        "source": "2",
        "target": "9",
        "relation": "Adverbial"
      },
      {
        "source": "3",
        "target": "9",
        "relation": "Agent"
      },
      {
        "source": "4",
        "target": "6",
        "relation": "Theme"
      },
      {
        "source": "5",
        "target": "6",
        "relation": "Adverbial"
      },
      {
        "source": "6",
        "target": "9",
        "relation": "Purpose"
      },
      {
        "source": "7",
        "target": "9",
        "relation": "Adverbial"
      },
      {
        "source": "8",
        "target": "9",
        "relation": "Theme"
      },
      {
        "source": "9",
        "target": "12",
        "relation": "Co-Event"
      },
      {
        "source": "10",
        "target": "12",
        "relation": "Time"
      },
      {
        "source": "11",
        "target": "12",
        "relation": "Theme"
      }
    ]
  }

export { ARENA_RANKINGS, CHALLENGE_RANKINGS, SAMPLE_UCCA };