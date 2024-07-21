type ArtistType = {
  name: string,
  link ?: string,
}

type EventType = {
  name: string,
  date: string,
  time: string,
  status: string,
  details: string,
  featuredArtists: ArtistType[],
  featuredProducts: string[],
}

export {
  type ArtistType,
  type EventType
}