type ArtistType = {
  name: string,
  link ?: string,
}

type EventType = {
  _id: string,
  name: string,
  date: string,
  time: string,
  status: string,
  details: string,
  featuredArtists: ArtistType[],
  featuredProducts: string[],

  poster: string,
  media: string[]
}

export {
  type ArtistType,
  type EventType
}