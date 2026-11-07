"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle2,
  Check,
  SunMedium,
  Droplets,
  Sparkles,
  Sprout,
  Info,
  ArrowLeft,
} from 'lucide-react'

export default function BiokonversiPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#006B45] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
          </Link>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-[#006B45] rounded-full">
            WasteWise Biokonversi BSF Studio
          </span>
        </div>

        {/* SECTION BIOKONVERSI BSF LENGKAP */}
        <section id="maggot-bsf" className="py-12 px-6 sm:px-10 bg-white rounded-3xl border border-emerald-200/90 shadow-sm space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#006B45] uppercase tracking-wider bg-[#DDF7EA] px-3.5 py-1.5 rounded-full border border-emerald-200">
              Inovasi Biokonversi Ramah Lingkungan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B36] tracking-tight">
              Dari Sampah Organik Menjadi Beragam Produk Bernilai
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Sampah organik bukan sekadar sisa yang harus dibuang. Melalui budidaya maggot Black Soldier Fly (BSF), sisa makanan dan bahan organik dimanfaatkan menjadi pakan protein tinggi, pupuk cair LERIGOT, dan pupuk kasgot pembenah tanah.
            </p>
          </div>

          {/* Galeri Visual 3 Kolom Menampilkan Foto Asli Produk & Budidaya Nyata */}
          <div className="space-y-4 pt-2">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#142B36]">
                Bukti Nyata Pengolahan & Produk Biokonversi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Dokumentasi proses nyata dari budidaya larva BSF hingga produk hilirisasi pupuk organik dan pakan bernilai tambah.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Kolom 1: Foto Larva BSF Sedang Mengurai Sampah (maggot_mengurai_sampah.jpeg) */}
              <div className="bg-white rounded-3xl border border-emerald-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-60 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src="/images/maggot_mengurai_sampah.jpeg"
                      alt="Foto Dokumentasi Nyata Larva BSF Aktif Mengurai Sampah Organik"
                      fill
                      unoptimized
                      className="object-cover object-center hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#006B45] bg-[#DDF7EA] px-2.5 py-0.5 rounded-md border border-emerald-200">
                        Proses Biokonversi
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">14-21 Hari Siklus</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-[#142B36]">Larva BSF Mengurai Sampah</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ribuan larva BSF secara aktif dan higienis mendekomposisi limbah organik rumah tangga tanpa menimbulkan bau busuk, mereduksi volume sampah organik hingga 70–80%.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 text-[11px] font-semibold text-[#006B45] flex items-center gap-1.5 border-t border-slate-100 mx-5 pb-4">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Zero Waste to Landfill
                </div>
              </div>

              {/* Kolom 2: Foto Asli Maggot Siap Panen (maggot_siap_panen.jpeg) */}
              <div className="bg-white rounded-3xl border border-teal-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-60 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src="/images/maggot_siap_panen.jpeg"
                      alt="Foto Dokumentasi Nyata Biomassa Maggot BSF Siap Panen"
                      fill
                      unoptimized
                      className="object-cover object-center hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-md border border-teal-200">
                        Biomassa Segar
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">Panen Berkualitas</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-[#142B36]">Biomassa Maggot Siap Panen</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Hasil panen larva maggot segar padat protein (40–45%) yang ditiriskan bersih pada ayakan, siap dipasok sebagai pakan unggas dan budidaya ikan lele lokal.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 text-[11px] font-semibold text-teal-800 flex items-center gap-1.5 border-t border-slate-100 mx-5 pb-4">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Pakan Alternatif Berprotein Tinggi
                </div>
              </div>

              {/* Kolom 3: Foto Asli Pupuk Organik Kasgot BSF (kasgot.jpeg) */}
              <div className="bg-white rounded-3xl border border-amber-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-60 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src="/images/kasgot.jpeg"
                      alt="Foto Dokumentasi Nyata Pupuk Organik Kasgot Bekas Maggot BSF"
                      fill
                      unoptimized
                      className="object-cover object-center hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200">
                        Pupuk Kasgot Teruji
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">100% Organik</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-[#142B36]">Pupuk Organik Kasgot BSF</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Residu media penguraian (frass) dikemas higienis menjadi pupuk organik padat kaya hara makro (N, P, K) untuk menyuburkan tanah dan pertanian warga desa.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 text-[11px] font-semibold text-amber-800 flex items-center gap-1.5 border-t border-slate-100 mx-5 pb-4">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Nutrisi Alami Tanpa Kimia Sintetis
                </div>
              </div>
            </div>
          </div>

          {/* 5 KARTU PRODUK TURUNAN: SELURUH LIMA KARTU MEMILIKI GAMBAR NYATA & TATA LETAK SEIMBANG */}
          <div className="space-y-6 pt-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-[#009B63] uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-emerald-200">
                Diversifikasi Komoditas
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#142B36] mt-2">
                Hasil & Produk Turunan Bernilai Tinggi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Seluruh produk memiliki peran strategis dalam rantai pasok ekonomi sirkular desa dan peternakan rakyat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {/* Kartu 1: Maggot Segar */}
              <div className="rounded-3xl border border-emerald-200 bg-white p-4.5 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full group">
                <div className="space-y-3.5">
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100">
                    <Image
                      src="/images/maggot_siap_panen.jpeg"
                      alt="Foto Asli Maggot Segar Pakan Hidup"
                      fill
                      unoptimized
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Pakan Segar
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Biomassa Hidup</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#142B36]">Maggot Segar (Pakan Hidup)</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    Larva maggot hidup segar berprotein tinggi (40-45%) yang disaring bersih, pakan bernutrisi tinggi untuk unggas dan budidaya ikan lele lokal.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[10px] text-emerald-800 font-semibold flex items-center gap-1.5 mt-3">
                  <Check className="h-3.5 w-3.5 shrink-0" /> Protein 40–45% Alami
                </div>
              </div>

              {/* Kartu 2: Maggot Kering */}
              <div className="rounded-3xl border border-amber-200 bg-white p-4.5 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full group">
                <div className="space-y-3.5">
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-amber-50 border border-amber-100">
                    <Image
                      src="/images/maggot_kering.jpeg"
                      alt="Foto Asli Maggot BSF Kering Tahan Simpan dalam Toples"
                      fill
                      unoptimized
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Pakan Kering
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Tahan Simpan</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#142B36]">Maggot Kering (Dried BSF)</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    Maggot hasil pengeringan higienis berkadar air rendah dalam kemasan toples kedap udara, awet disimpan lama untuk pakan burung kicau dan ikan hias.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[10px] text-amber-800 font-semibold flex items-center gap-1.5 mt-3">
                  <SunMedium className="h-3.5 w-3.5 shrink-0" /> Awet & Kadar Air Rendah
                </div>
              </div>

              {/* Kartu 3: LERIGOT (Pupuk Cair BSF) */}
              <div className="rounded-3xl border border-teal-200 bg-white p-4.5 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full group">
                <div className="space-y-3.5">
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-teal-50 border border-teal-100">
                    <Image
                      src="/images/lerigot.jpeg"
                      alt="Foto Asli Botol Pupuk Organik Cair LERIGOT Hasil Biokonversi Maggot"
                      fill
                      unoptimized
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                      Pupuk Cair POC
                    </span>
                    <span className="text-[10px] text-teal-700 font-semibold">Inovasi Fermentasi</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#142B36]">LERIGOT (Pupuk Cair BSF)</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    Inovasi pupuk organik cair (POC) hasil fermentasi leri dan cairan biokonversi maggot yang kaya mikroorganisme baik serta enzim penyubur tanaman hortikultura.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[10px] text-teal-800 font-semibold flex items-center gap-1.5 mt-3">
                  <Droplets className="h-3.5 w-3.5 shrink-0" /> Kaya Enzim & Mikroba Alami
                </div>
              </div>

              {/* Kartu 4: Kasgot (Pupuk Organik Padat) */}
              <div className="rounded-3xl border border-amber-200 bg-white p-4.5 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full group">
                <div className="space-y-3.5">
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-amber-50 border border-amber-100">
                    <Image
                      src="/images/kasgot.jpeg"
                      alt="Foto Asli Pupuk Kasgot Bekas Maggot BSF Kemasan Toples"
                      fill
                      unoptimized
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Pupuk Padat
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Nutrisi Makro</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#142B36]">Kasgot (Pupuk Organik Padat)</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    Pupuk bekas maggot (frass) berkualitas tinggi dengan kandungan nitrogen, fosfor, dan kalium seimbang untuk meningkatkan kesuburan tanah gembur.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[10px] text-amber-800 font-semibold flex items-center gap-1.5 mt-3">
                  <Sprout className="h-3.5 w-3.5 shrink-0" /> Unsur Hara N-P-K Lengkap
                </div>
              </div>

              {/* Kartu 5: Larva Pengurai (Dekomposer) */}
              <div className="rounded-3xl border border-emerald-200 bg-white p-4.5 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full group">
                <div className="space-y-3.5">
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100">
                    <Image
                      src="/images/maggot_mengurai_sampah.jpeg"
                      alt="Foto Asli Koloni Larva BSF Aktif Mengurai Sampah Organik"
                      fill
                      unoptimized
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Biokonversi Aktif
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Dekomposer Sampah</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#142B36]">Larva Pengurai (Dekomposer)</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    Koloni larva BSF aktif pengurai sisa makanan rumah tangga secara mandiri di bank sampah maupun pekarangan warga, mereduksi sampah basah tanpa bau.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[10px] text-emerald-800 font-semibold flex items-center gap-1.5 mt-3">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" /> Reduksi Sampah Basah 70–80%
                </div>
              </div>
            </div>
          </div>

          {/* Transparansi Hilirisasi */}
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
            <Info className="h-4 w-4 text-[#006B45] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Catatan Transparansi Hilirisasi:</strong> Seluruh foto di atas merupakan dokumentasi pengolahan nyata dari budidaya maggot BSF dan produk turunan pupuk organik yang dihasilkan melalui mitra pembudidaya dan pengolah terverifikasi WasteWise.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

