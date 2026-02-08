interface PeopleResponse {
  message: string;
  total_records: number;
  total_pages: number;
  previous: null;
  next: string;
  results: PersonItem[];
  apiVersion: string;
  timestamp: string;
  support: Support;
  social: Social;
}

interface PersonItem {
  uid: string;
  name: string;
  url: string;
}

interface Social {
  discord: string;
  reddit: string;
  github: string;
}

interface Support {
  contact: string;
  donate: string;
  partnerDiscounts: PartnerDiscounts;
}

interface PartnerDiscounts {
  saberMasters: SaberMasters;
  heartMath: SaberMasters;
}

interface SaberMasters {
  link: string;
  details: string;
}

interface Details {
  message: string;
  result: Result;
  apiVersion: string;
  timestamp: string;
  support: Support;
  social: Social;
}

interface Result {
  properties: Properties;
  _id: string;
  description: string;
  uid: string;
  __v: number;
}

interface Properties {
  created: string;
  edited: string;
  name: string;
  gender: string;
  skin_color: string;
  hair_color: string;
  height: string;
  eye_color: string;
  mass: string;
  homeworld: string;
  birth_year: string;
  vehicles: string[];
  starships: string[];
  films: string[];
  url: string;
}
