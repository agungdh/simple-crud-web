export interface PangkatGolonganRequest {
  readonly jenjang: string;
  readonly pangkat: string;
  readonly golongan: string;
  readonly ruang: string;
}

export interface PangkatGolonganResponse {
  readonly uuid: string;
  readonly jenjang: string;
  readonly pangkat: string;
  readonly golongan: string;
  readonly ruang: string;
}
