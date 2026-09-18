export type ServiceArea = {
  slug: string;
  city: string;
  county: string;
  region: string;
  jobCities: string[];
};

export const serviceAreas: ServiceArea[] = [
  {slug: 'san-francisco', city: 'San Francisco', county: 'San Francisco County', region: 'San Francisco', jobCities: ['San Francisco']},
  {slug: 'danville', city: 'Danville', county: 'Contra Costa County', region: 'the East Bay', jobCities: ['Danville', 'Danville/Blackhawk']},
  {slug: 'walnut-creek', city: 'Walnut Creek', county: 'Contra Costa County', region: 'the East Bay', jobCities: ['Walnut Creek']},
  {slug: 'palo-alto', city: 'Palo Alto', county: 'Santa Clara County', region: 'the Peninsula', jobCities: ['Palo Alto']},
  {slug: 'san-ramon', city: 'San Ramon', county: 'Contra Costa County', region: 'the East Bay', jobCities: ['San Ramon']},
  {slug: 'san-carlos', city: 'San Carlos', county: 'San Mateo County', region: 'the Peninsula', jobCities: ['San Carlos']},
  {slug: 'san-mateo', city: 'San Mateo', county: 'San Mateo County', region: 'the Peninsula', jobCities: ['San Mateo']},
  {slug: 'fremont', city: 'Fremont', county: 'Alameda County', region: 'the East Bay', jobCities: ['Fremont']},
];

export const serviceAreaByCity = new Map(serviceAreas.map((area) => [area.city, area]));
