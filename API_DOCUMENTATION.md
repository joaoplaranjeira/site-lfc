# API Documentation - Portal das Competições

## Overview
This document describes the API endpoints and data structures expected by the competitions portal.

## Base Configuration
Update the `API_CONFIG` object in `competicoes.html`:

```javascript
const API_CONFIG = {
  baseUrl: 'https://api.lecafc.pt', // Replace with your actual API URL
  endpoints: {
    calendar: '/competitions/calendar',
    classification: '/competitions/classification',
    results: '/competitions/results'
  }
};
```

## Endpoints

### 1. Calendar (Calendário)
**Endpoint:** `GET /competitions/calendar`

**Description:** Returns upcoming matches

**Response Format:**
```json
[
  {
    "id": "match-1",
    "date": "2025-11-16T15:00:00Z",
    "homeTeam": "Leça FC",
    "awayTeam": "FC Adversário",
    "competition": "Campeonato Distrital",
    "round": "10",
    "venue": "Campo do Leça"
  },
  {
    "id": "match-2",
    "date": "2025-11-24T11:00:00Z",
    "homeTeam": "Outro Clube",
    "awayTeam": "Leça FC",
    "competition": "Campeonato Distrital",
    "round": "11",
    "venue": "Campo Adversário"
  }
]
```

**Field Descriptions:**
- `id` (string, required): Unique match identifier
- `date` (string, required): ISO 8601 date-time format
- `homeTeam` (string, required): Home team name
- `awayTeam` (string, required): Away team name
- `competition` (string, required): Competition name
- `round` (string, optional): Round/Jornada number
- `venue` (string, optional): Match venue/location

**Notes:**
- Matches should be sorted by date (ascending)
- Only future matches should be included
- If `homeTeam` or `awayTeam` contains "Leça" (case-insensitive), the match card will be highlighted in green

---

### 2. Classification (Classificação)
**Endpoint:** `GET /competitions/classification`

**Description:** Returns league standings

**Response Format:**
```json
[
  {
    "position": 1,
    "team": "Equipa A",
    "played": 9,
    "won": 7,
    "drawn": 1,
    "lost": 1,
    "goalsFor": 22,
    "goalsAgainst": 8,
    "points": 22
  },
  {
    "position": 2,
    "team": "Leça FC",
    "played": 9,
    "won": 6,
    "drawn": 2,
    "lost": 1,
    "goalsFor": 19,
    "goalsAgainst": 10,
    "points": 20
  }
]
```

**Field Descriptions:**
- `position` (number, required): Current position in table
- `team` (string, required): Team name
- `played` (number, required): Games played (J)
- `won` (number, required): Victories (V)
- `drawn` (number, required): Draws (E)
- `lost` (number, required): Defeats (D)
- `goalsFor` (number, required): Goals scored (GM)
- `goalsAgainst` (number, required): Goals conceded (GS)
- `points` (number, required): Total points (Pts)

**Notes:**
- Teams should be sorted by position (ascending)
- Leça FC row will be automatically highlighted

---

### 3. Results (Resultados)
**Endpoint:** `GET /competitions/results`

**Description:** Returns recent match results

**Response Format:**
```json
[
  {
    "id": "result-1",
    "date": "2025-11-09T15:00:00Z",
    "homeTeam": "Leça FC",
    "awayTeam": "FC Adversário",
    "homeScore": 3,
    "awayScore": 1,
    "competition": "Campeonato Distrital",
    "round": "9"
  },
  {
    "id": "result-2",
    "date": "2025-11-03T11:00:00Z",
    "homeTeam": "Outro Clube",
    "awayTeam": "Leça FC",
    "homeScore": 2,
    "awayScore": 2,
    "competition": "Campeonato Distrital",
    "round": "8"
  }
]
```

**Field Descriptions:**
- `id` (string, required): Unique result identifier
- `date` (string, required): ISO 8601 date-time format
- `homeTeam` (string, required): Home team name
- `awayTeam` (string, required): Away team name
- `homeScore` (number, required): Home team final score
- `awayScore` (number, required): Away team final score
- `competition` (string, required): Competition name
- `round` (string, optional): Round/Jornada number

**Notes:**
- Results should be sorted by date (descending - newest first)
- Only completed matches should be included
- Result cards will be color-coded automatically:
  - **Green**: Leça FC won
  - **Yellow**: Draw
  - **Red**: Leça FC lost

---

## Error Handling

All endpoints should return appropriate HTTP status codes:
- `200 OK`: Successful request
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
  "error": true,
  "message": "Error description"
}
```

---

## CORS Configuration

Ensure your API allows requests from your domain:
```
Access-Control-Allow-Origin: https://universo.lecafc.pt
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: Content-Type
```

---

## Testing

You can test the implementation with sample data by temporarily replacing the fetch calls with:

```javascript
// Sample data for testing
const sampleMatches = [
  {
    id: "1",
    date: "2025-11-16T15:00:00Z",
    homeTeam: "Leça FC",
    awayTeam: "FC Porto B",
    competition: "Campeonato Distrital",
    round: "10"
  }
];

// Use this in loadCalendarData() temporarily
container.innerHTML = sampleMatches.map(match => renderMatchCard(match)).join('');
```

---

## Future Enhancements

Possible additions to the API:
1. Match details endpoint (`/competitions/matches/{id}`)
2. Team statistics endpoint
3. Player statistics endpoint
4. Live match updates (WebSocket)
5. Filtering by competition/team
6. Pagination for large datasets
