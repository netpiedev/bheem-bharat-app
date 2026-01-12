/* =========================================
   Buddha Vihar – Frontend Types
   Location: app/types/buddhavihar.types.ts
========================================= */

/* ---------- API Wrapper ---------- */

export interface ApiListResponse<T> {
  status: "success";
  count: number;
  data: T[];
}

export interface ApiSingleResponse<T> {
  status: "success";
  data: T;
}

/* ---------- States Screen ---------- */
/* GET /resources/buddhavihars/states */

export interface BuddhaViharState {
  id: string;
  name: string;
  totalCities: number;
  totalBuddhaVihars: number;
}

/* ---------- Cities Screen ---------- */
/* GET /resources/buddhavihars/states/:stateId/cities */

export interface BuddhaViharCity {
  id: string;
  name: string;
  totalBuddhaVihars: number;
}

/* ---------- Vihar List Screen ---------- */
/* GET /resources/buddhavihars/cities/:cityId/vihars */

export interface BuddhaViharListItem {
  id: string;
  name: string;
  address: string | null;
}

/* ---------- Vihar Details Screen ---------- */
/* GET /resources/buddhavihars/vihars/:viharId */

export interface BuddhaViharDetails {
  id: string;
  name: string;

  address: string | null;
  pincode: string | null;

  phone: string | null;
  email: string | null;

  description: string | null;
  created_at: string;

  state: {
    id: string;
    name: string;
  };

  city: {
    id: string;
    name: string;
  };
}
