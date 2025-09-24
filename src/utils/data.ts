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

  const ALL_TEMPLATES = [
    {
      "user_detail": {
        "username": "tenzintsering",
        "first_name": "",
        "last_name": "",
        "email": "tenzintsering@dharmaduta.in",
        "picture": "https://lh3.googleusercontent.com/a/ACg8ocIhKAZ7wEUzD7L2K032qn8J4F2koD6122VOjp_7K_qFRfA49A=s96-c",
        "role": "user"
      },
      "template_detail": {
        "id": "b8ddf817-f50e-4e6c-96fb-55d08a369106",
        "template_name": "new testing template 1",
        "user_id": "google-oauth2|115815322691436094429",
        "template": "This is {source} generate ucca",
        "challenge_id": "3e9aa7a7-6054-414d-a073-09f62698d17b",
        "text_category": "UCCA",
        "challenge_name": "My first challenge",
        "from_language": "Tibetan",
        "to_language": "English",
        "created_at": "2025-09-24T12:59:01.397382",
        "updated_at": "2025-09-24T12:59:01.397388"
      }
    },
    {
      "user_detail": {
        "username": "dorjeyangchen",
        "first_name": "Dorje",
        "last_name": "Yangchen",
        "email": "dorje.yangchen@example.com",
        "picture": "https://randomuser.me/api/portraits/women/65.jpg",
        "role": "admin"
      },
      "template_detail": {
        "id": "e4218ab4-77ac-4cf5-9cb8-2a24831a5d66",
        "template_name": "formal translation template",
        "user_id": "auth0|aa9219384729",
        "template": "Translate formally: {source}",
        "challenge_id": "c451ed65-2c9b-4f7a-a2b6-4b736aa6dff1",
        "text_category": "formal",
        "challenge_name": "Business Email Translation",
        "from_language": "French",
        "to_language": "English",
        "created_at": "2025-09-20T10:14:55.123456",
        "updated_at": "2025-09-21T09:03:11.987654"
      }
    },
    {
      "user_detail": {
        "username": "karma123",
        "first_name": "Karma",
        "last_name": "Tashi",
        "email": "karma.tashi@example.com",
        "picture": "https://randomuser.me/api/portraits/men/23.jpg",
        "role": "user"
      },
      "template_detail": {
        "id": "f1f3c2b5-51f4-4d33-b999-86af94e3b25d",
        "template_name": "idiom translator",
        "user_id": "google-oauth2|998877665544",
        "template": "Interpret and translate idiomatically: {source}",
        "challenge_id": "a2217c99-004a-40f0-baf6-73c95c91a312",
        "text_category": "idiom",
        "challenge_name": "Idioms and Proverbs",
        "from_language": "Chinese",
        "to_language": "English",
        "created_at": "2025-09-22T08:43:30.654321",
        "updated_at": "2025-09-22T08:43:30.654789"
      }
    }
  ]
  

export { ARENA_RANKINGS, CHALLENGE_RANKINGS, SAMPLE_UCCA, ALL_TEMPLATES };