import { BidangResponse } from './bidang.model';
import { PangkatGolonganResponse } from './pangkat-golongan.model';
import { UserResponse } from './auth.model';

export type PegawaiTipe = 'pegawai' | 'admin';
export type PegawaiStatus = 'aktif' | 'non aktif';
export type KategoriJabatan = 'struktural' | 'fungsional auditor' | 'fungsional tertentu';
export type KategoriKebutuhanJamPelatihan = 'admin' | 'pejabat' | 'auditor';

export interface CreatePegawaiRequest {
  readonly username: string;
  readonly password: string;
  readonly bidangUuid: string;
  readonly pangkatGolonganUuid: string | null;
  readonly tipe: PegawaiTipe;
  readonly status: PegawaiStatus;
  readonly nip: string;
  readonly nama: string;
  readonly jabatan: string | null;
  readonly kategoriJabatan: KategoriJabatan | null;
  readonly peran: string | null;
  readonly kategoriKebutuhanJamPelatihan: KategoriKebutuhanJamPelatihan | null;
}

export interface UpdatePegawaiRequest {
  readonly username: string;
  readonly password: string | null;
  readonly bidangUuid: string;
  readonly pangkatGolonganUuid: string | null;
  readonly tipe: PegawaiTipe;
  readonly status: PegawaiStatus;
  readonly nip: string;
  readonly nama: string;
  readonly jabatan: string | null;
  readonly kategoriJabatan: KategoriJabatan | null;
  readonly peran: string | null;
  readonly kategoriKebutuhanJamPelatihan: KategoriKebutuhanJamPelatihan | null;
}

export interface PegawaiResponse {
  readonly uuid: string;
  readonly userUuid: string;
  readonly bidangUuid: string;
  readonly pangkatGolonganUuid: string | null;
  readonly tipe: PegawaiTipe;
  readonly status: PegawaiStatus;
  readonly nip: string;
  readonly nama: string;
  readonly jabatan: string | null;
  readonly kategoriJabatan: KategoriJabatan | null;
  readonly peran: string | null;
  readonly kategoriKebutuhanJamPelatihan: KategoriKebutuhanJamPelatihan | null;
  readonly user: UserResponse;
  readonly bidang: BidangResponse;
  readonly pangkatGolongan: PangkatGolonganResponse | null;
}
