import { BidangResponse, BidangRequest } from '../models/bidang.model';
import { PangkatGolonganResponse, PangkatGolonganRequest } from '../models/pangkat-golongan.model';
import {
  CreatePegawaiRequest,
  PegawaiResponse,
  UpdatePegawaiRequest,
} from '../models/pegawai.model';
import { UserResponse } from '../models/auth.model';

export interface MockUserRecord {
  uuid: string;
  username: string;
  password: string;
}

export interface MockPegawaiRecord {
  uuid: string;
  userUuid: string;
  bidangUuid: string;
  pangkatGolonganUuid: string | null;
  tipe: 'pegawai' | 'admin';
  status: 'aktif' | 'non aktif';
  nip: string;
  nama: string;
  jabatan: string | null;
  kategoriJabatan: 'struktural' | 'fungsional auditor' | 'fungsional tertentu' | null;
  peran: string | null;
  kategoriKebutuhanJamPelatihan: 'admin' | 'pejabat' | 'auditor' | null;
}

const SEED_BIDANG: BidangResponse[] = [
  {
    uuid: '019352a1-7b40-7000-8000-000000000010',
    bidang: 'Inspektorat Pembantu Wilayah I',
  },
  {
    uuid: '019352a1-7b40-7000-8000-000000000011',
    bidang: 'Inspektorat Pembantu Wilayah II',
  },
  {
    uuid: '019352a1-7b40-7000-8000-000000000012',
    bidang: 'Sekretariat',
  },
];

const SEED_PANGKAT: PangkatGolonganResponse[] = [
  {
    uuid: '019352a1-7b40-7000-8000-000000000020',
    jenjang: 'Penata',
    pangkat: 'Penata Muda Tingkat I',
    golongan: 'III',
    ruang: 'b',
  },
  {
    uuid: '019352a1-7b40-7000-8000-000000000021',
    jenjang: 'Penata',
    pangkat: 'Penata',
    golongan: 'III',
    ruang: 'c',
  },
  {
    uuid: '019352a1-7b40-7000-8000-000000000022',
    jenjang: 'Pembina',
    pangkat: 'Pembina',
    golongan: 'IV',
    ruang: 'a',
  },
];

const SEED_USERS: MockUserRecord[] = [
  {
    uuid: '019352a1-7b40-7000-8000-000000000001',
    username: '199701012022031001',
    password: 'password123',
  },
  {
    uuid: '019352a1-7b40-7000-8000-000000000002',
    username: '199002152015031002',
    password: 'password123',
  },
  {
    uuid: '019352a1-7b40-7000-8000-000000000003',
    username: '198506102010011003',
    password: 'password123',
  },
];

const SEED_PEGAWAI: MockPegawaiRecord[] = [
  {
    uuid: '019352a1-7b40-7000-8000-000000000030',
    userUuid: '019352a1-7b40-7000-8000-000000000001',
    bidangUuid: '019352a1-7b40-7000-8000-000000000010',
    pangkatGolonganUuid: '019352a1-7b40-7000-8000-000000000020',
    tipe: 'admin',
    status: 'aktif',
    nip: '199701012022031001',
    nama: 'Agung Sapto Margono',
    jabatan: 'Auditor Ahli Pertama',
    kategoriJabatan: 'fungsional auditor',
    peran: 'Ketua Tim',
    kategoriKebutuhanJamPelatihan: 'auditor',
  },
  {
    uuid: '019352a1-7b40-7000-8000-000000000031',
    userUuid: '019352a1-7b40-7000-8000-000000000002',
    bidangUuid: '019352a1-7b40-7000-8000-000000000011',
    pangkatGolonganUuid: '019352a1-7b40-7000-8000-000000000021',
    tipe: 'pegawai',
    status: 'aktif',
    nip: '199002152015031002',
    nama: 'Siti Rahmawati, S.E.',
    jabatan: 'Auditor Muda',
    kategoriJabatan: 'fungsional auditor',
    peran: 'Anggota Tim',
    kategoriKebutuhanJamPelatihan: 'auditor',
  },
  {
    uuid: '019352a1-7b40-7000-8000-000000000032',
    userUuid: '019352a1-7b40-7000-8000-000000000003',
    bidangUuid: '019352a1-7b40-7000-8000-000000000012',
    pangkatGolonganUuid: '019352a1-7b40-7000-8000-000000000022',
    tipe: 'pegawai',
    status: 'non aktif',
    nip: '198506102010011003',
    nama: 'Drs. Bambang Hariyanto',
    jabatan: 'Sekretaris Inspektorat',
    kategoriJabatan: 'struktural',
    peran: 'Pejabat Struktural',
    kategoriKebutuhanJamPelatihan: 'pejabat',
  },
];

export class MockDatabase {
  private bidangList: BidangResponse[] = [...SEED_BIDANG];
  private pangkatList: PangkatGolonganResponse[] = [...SEED_PANGKAT];
  private users: MockUserRecord[] = [...SEED_USERS];
  private pegawaiList: MockPegawaiRecord[] = [...SEED_PEGAWAI];
  private activeSessions = new Map<string, string>(); // token -> userUuid

  constructor() {
    this.loadFromStorage();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private saveToStorage(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem('simon_mock_bidang', JSON.stringify(this.bidangList));
      localStorage.setItem('simon_mock_pangkat', JSON.stringify(this.pangkatList));
      localStorage.setItem('simon_mock_users', JSON.stringify(this.users));
      localStorage.setItem('simon_mock_pegawai', JSON.stringify(this.pegawaiList));
    } catch {
      // Ignore storage errors
    }
  }

  private loadFromStorage(): void {
    if (!this.isBrowser()) return;
    try {
      const b = localStorage.getItem('simon_mock_bidang');
      if (b) this.bidangList = JSON.parse(b);
      const p = localStorage.getItem('simon_mock_pangkat');
      if (p) this.pangkatList = JSON.parse(p);
      const u = localStorage.getItem('simon_mock_users');
      if (u) this.users = JSON.parse(u);
      const pg = localStorage.getItem('simon_mock_pegawai');
      if (pg) this.pegawaiList = JSON.parse(pg);
    } catch {
      // Ignore parse errors
    }
  }

  public generateUuid(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return '019352a1-' + Math.random().toString(16).substring(2, 6) + '-7000-8000-' + Math.random().toString(16).substring(2, 14);
  }

  // Auth operations
  public login(username: string, password: string): { token: string; userUuid: string } | null {
    const user = this.users.find(
      (u) => (u.username === username || (username === 'admin' && u.username === '199701012022031001')) && u.password === password,
    );
    if (!user) return null;

    const token = 'simon-token-' + this.generateUuid();
    this.activeSessions.set(token, user.uuid);
    return { token, userUuid: user.uuid };
  }

  public logout(token: string): boolean {
    return this.activeSessions.delete(token);
  }

  public getUserByToken(token: string): MockUserRecord | null {
    const userUuid = this.activeSessions.get(token);
    if (!userUuid) {
      // Also allow pre-set mock admin token for easier testing
      if (token.startsWith('simon-token-')) {
        return this.users[0] ?? null;
      }
      return null;
    }
    return this.users.find((u) => u.uuid === userUuid) ?? null;
  }

  public getPegawaiByUserId(userUuid: string): PegawaiResponse | null {
    const record = this.pegawaiList.find((p) => p.userUuid === userUuid);
    if (!record) return null;
    return this.mapToPegawaiResponse(record);
  }

  // Bidang CRUD
  public listBidang(): BidangResponse[] {
    return [...this.bidangList];
  }

  public getBidang(uuid: string): BidangResponse | null {
    return this.bidangList.find((b) => b.uuid === uuid) ?? null;
  }

  public createBidang(req: BidangRequest): BidangResponse {
    const newBidang: BidangResponse = {
      uuid: this.generateUuid(),
      bidang: req.bidang.trim(),
    };
    this.bidangList.push(newBidang);
    this.saveToStorage();
    return newBidang;
  }

  public updateBidang(uuid: string, req: BidangRequest): BidangResponse | null {
    const idx = this.bidangList.findIndex((b) => b.uuid === uuid);
    if (idx === -1) return null;
    const updated: BidangResponse = { uuid, bidang: req.bidang.trim() };
    this.bidangList[idx] = updated;
    this.saveToStorage();
    return updated;
  }

  public deleteBidang(uuid: string): boolean {
    const idx = this.bidangList.findIndex((b) => b.uuid === uuid);
    if (idx === -1) return false;
    this.bidangList.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  // Pangkat Golongan CRUD
  public listPangkatGolongan(): PangkatGolonganResponse[] {
    return [...this.pangkatList];
  }

  public getPangkatGolongan(uuid: string): PangkatGolonganResponse | null {
    return this.pangkatList.find((p) => p.uuid === uuid) ?? null;
  }

  public createPangkatGolongan(req: PangkatGolonganRequest): PangkatGolonganResponse {
    const newPangkat: PangkatGolonganResponse = {
      uuid: this.generateUuid(),
      jenjang: req.jenjang.trim(),
      pangkat: req.pangkat.trim(),
      golongan: req.golongan.trim(),
      ruang: req.ruang.trim(),
    };
    this.pangkatList.push(newPangkat);
    this.saveToStorage();
    return newPangkat;
  }

  public updatePangkatGolongan(uuid: string, req: PangkatGolonganRequest): PangkatGolonganResponse | null {
    const idx = this.pangkatList.findIndex((p) => p.uuid === uuid);
    if (idx === -1) return null;
    const updated: PangkatGolonganResponse = {
      uuid,
      jenjang: req.jenjang.trim(),
      pangkat: req.pangkat.trim(),
      golongan: req.golongan.trim(),
      ruang: req.ruang.trim(),
    };
    this.pangkatList[idx] = updated;
    this.saveToStorage();
    return updated;
  }

  public deletePangkatGolongan(uuid: string): boolean {
    const idx = this.pangkatList.findIndex((p) => p.uuid === uuid);
    if (idx === -1) return false;
    this.pangkatList.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  // Pegawai CRUD
  public listPegawai(): PegawaiResponse[] {
    return this.pegawaiList.map((p) => this.mapToPegawaiResponse(p));
  }

  public getPegawai(uuid: string): PegawaiResponse | null {
    const p = this.pegawaiList.find((item) => item.uuid === uuid);
    if (!p) return null;
    return this.mapToPegawaiResponse(p);
  }

  public createPegawai(req: CreatePegawaiRequest): PegawaiResponse {
    const userUuid = this.generateUuid();
    const newUser: MockUserRecord = {
      uuid: userUuid,
      username: req.username.trim(),
      password: req.password,
    };
    this.users.push(newUser);

    const pegawaiUuid = this.generateUuid();
    const newPegawai: MockPegawaiRecord = {
      uuid: pegawaiUuid,
      userUuid,
      bidangUuid: req.bidangUuid,
      pangkatGolonganUuid: req.pangkatGolonganUuid || null,
      tipe: req.tipe,
      status: req.status,
      nip: req.nip.trim(),
      nama: req.nama.trim(),
      jabatan: req.jabatan ? req.jabatan.trim() : null,
      kategoriJabatan: req.kategoriJabatan || null,
      peran: req.peran ? req.peran.trim() : null,
      kategoriKebutuhanJamPelatihan: req.kategoriKebutuhanJamPelatihan || null,
    };
    this.pegawaiList.push(newPegawai);
    this.saveToStorage();
    return this.mapToPegawaiResponse(newPegawai);
  }

  public updatePegawai(uuid: string, req: UpdatePegawaiRequest): PegawaiResponse | null {
    const pIdx = this.pegawaiList.findIndex((p) => p.uuid === uuid);
    if (pIdx === -1) return null;
    const currentPegawai = this.pegawaiList[pIdx];

    const uIdx = this.users.findIndex((u) => u.uuid === currentPegawai.userUuid);
    if (uIdx !== -1) {
      this.users[uIdx].username = req.username.trim();
      if (req.password) {
        this.users[uIdx].password = req.password;
      }
    }

    const updatedPegawai: MockPegawaiRecord = {
      ...currentPegawai,
      bidangUuid: req.bidangUuid,
      pangkatGolonganUuid: req.pangkatGolonganUuid || null,
      tipe: req.tipe,
      status: req.status,
      nip: req.nip.trim(),
      nama: req.nama.trim(),
      jabatan: req.jabatan ? req.jabatan.trim() : null,
      kategoriJabatan: req.kategoriJabatan || null,
      peran: req.peran ? req.peran.trim() : null,
      kategoriKebutuhanJamPelatihan: req.kategoriKebutuhanJamPelatihan || null,
    };

    this.pegawaiList[pIdx] = updatedPegawai;
    this.saveToStorage();
    return this.mapToPegawaiResponse(updatedPegawai);
  }

  public deletePegawai(uuid: string): boolean {
    const idx = this.pegawaiList.findIndex((p) => p.uuid === uuid);
    if (idx === -1) return false;
    const record = this.pegawaiList[idx];

    // Cascade delete user
    const uIdx = this.users.findIndex((u) => u.uuid === record.userUuid);
    if (uIdx !== -1) {
      this.users.splice(uIdx, 1);
    }

    this.pegawaiList.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  private mapToPegawaiResponse(record: MockPegawaiRecord): PegawaiResponse {
    const userRecord = this.users.find((u) => u.uuid === record.userUuid);
    const user: UserResponse = {
      uuid: record.userUuid,
      username: userRecord ? userRecord.username : record.nip,
    };

    const bidang = this.bidangList.find((b) => b.uuid === record.bidangUuid) ?? {
      uuid: record.bidangUuid,
      bidang: 'Bidang Tidak Ditemukan',
    };

    const pangkatGolongan = record.pangkatGolonganUuid
      ? (this.pangkatList.find((p) => p.uuid === record.pangkatGolonganUuid) ?? null)
      : null;

    return {
      uuid: record.uuid,
      userUuid: record.userUuid,
      bidangUuid: record.bidangUuid,
      pangkatGolonganUuid: record.pangkatGolonganUuid,
      tipe: record.tipe,
      status: record.status,
      nip: record.nip,
      nama: record.nama,
      jabatan: record.jabatan,
      kategoriJabatan: record.kategoriJabatan,
      peran: record.peran,
      kategoriKebutuhanJamPelatihan: record.kategoriKebutuhanJamPelatihan,
      user,
      bidang,
      pangkatGolongan,
    };
  }
}

export const mockDb = new MockDatabase();
