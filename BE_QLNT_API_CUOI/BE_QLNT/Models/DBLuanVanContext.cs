using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace BE_QLNT.Models
{
    public partial class DBLuanVanContext : DbContext
    {
        public DBLuanVanContext()
        {
        }

        public DBLuanVanContext(DbContextOptions<DBLuanVanContext> options)
            : base(options)
        {
        }

        public virtual DbSet<AnhPhongTro> AnhPhongTros { get; set; } = null!;
        public virtual DbSet<BaiDang> BaiDangs { get; set; } = null!;
        public virtual DbSet<DanhGium> DanhGia { get; set; } = null!;
        public virtual DbSet<HopDong> HopDongs { get; set; } = null!;
        public virtual DbSet<HopDongMau> HopDongMaus { get; set; } = null!;
        public virtual DbSet<LienHe> LienHes { get; set; } = null!;
        public virtual DbSet<LyDoTuChoi> LyDoTuChois { get; set; } = null!;
        public virtual DbSet<NguoiDung> NguoiDungs { get; set; } = null!;
        public virtual DbSet<PhongTro> PhongTros { get; set; } = null!;
        public virtual DbSet<ThanhToan> ThanhToans { get; set; } = null!;
        public virtual DbSet<TienIch> TienIches { get; set; } = null!;
        public virtual DbSet<TuCam> TuCams { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
                optionsBuilder.UseSqlServer("Server=LAPTOP-TTDT102;Database=DBLuanVan;Trusted_Connection=True;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AnhPhongTro>(entity =>
            {
                entity.HasKey(e => e.AnhId)
                    .HasName("PK__Anh_Phon__13C3343E6958ADFF");

                entity.ToTable("Anh_Phong_Tro");

                entity.Property(e => e.AnhId).HasColumnName("AnhID");

                entity.Property(e => e.BaiDangId).HasColumnName("BaiDangID");

                entity.Property(e => e.Url)
                    .HasMaxLength(255)
                    .HasColumnName("URL");

                entity.HasOne(d => d.BaiDang)
                    .WithMany(p => p.AnhPhongTros)
                    .HasForeignKey(d => d.BaiDangId)
                    .HasConstraintName("FK_Anh_Phong_Tro_Bai_Dang");
            });

            modelBuilder.Entity<BaiDang>(entity =>
            {
                entity.ToTable("Bai_Dang");

                entity.Property(e => e.BaiDangId).HasColumnName("BaiDangID");

                entity.Property(e => e.GiaThueBaiDang).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.NgayDang).HasColumnType("datetime");

                entity.Property(e => e.NgayHetHan).HasColumnType("datetime");

                entity.Property(e => e.PhuongXa).HasMaxLength(100);

                entity.Property(e => e.QuanHuyen).HasMaxLength(100);

                entity.Property(e => e.SoNha).HasMaxLength(100);

                entity.Property(e => e.TieuDe).HasMaxLength(255);

                entity.Property(e => e.TinhThanh).HasMaxLength(100);

                entity.Property(e => e.TrangThaiTin).HasMaxLength(50);

                entity.Property(e => e.UserId).HasColumnName("UserID");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.BaiDangs)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__Bai_Dang__UserID__398D8EEE");

                entity.HasMany(d => d.TienIches)
                    .WithMany(p => p.BaiDangs)
                    .UsingEntity<Dictionary<string, object>>(
                        "BaiDangTienIch",
                        l => l.HasOne<TienIch>().WithMany().HasForeignKey("TienIchId").OnDelete(DeleteBehavior.ClientSetNull).HasConstraintName("FK__BaiDang_T__TienI__44FF419A"),
                        r => r.HasOne<BaiDang>().WithMany().HasForeignKey("BaiDangId").OnDelete(DeleteBehavior.ClientSetNull).HasConstraintName("FK__BaiDang_T__BaiDa__440B1D61"),
                        j =>
                        {
                            j.HasKey("BaiDangId", "TienIchId").HasName("PK__BaiDang___6EA2B95D9F4FDA1E");

                            j.ToTable("BaiDang_TienIch");

                            j.IndexerProperty<int>("BaiDangId").HasColumnName("BaiDangID");

                            j.IndexerProperty<int>("TienIchId").HasColumnName("TienIchID");
                        });
            });

            modelBuilder.Entity<DanhGium>(entity =>
            {
                entity.HasKey(e => e.DanhGiaId)
                    .HasName("PK__Danh_Gia__52C0CA2536ABA766");

                entity.ToTable("Danh_Gia");

                entity.Property(e => e.DanhGiaId).HasColumnName("DanhGiaID");

                entity.Property(e => e.BaiDangId).HasColumnName("BaiDangID");

                entity.Property(e => e.NgayComment).HasColumnType("date");

                entity.Property(e => e.UserId).HasColumnName("UserID");

                entity.HasOne(d => d.BaiDang)
                    .WithMany(p => p.DanhGia)
                    .HasForeignKey(d => d.BaiDangId)
                    .HasConstraintName("FK_Danh_Gia_Bai_Dang");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.DanhGia)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__Danh_Gia__UserID__47DBAE45");
            });

            modelBuilder.Entity<HopDong>(entity =>
            {
                entity.ToTable("Hop_Dong");

                entity.Property(e => e.HopDongId).HasColumnName("HopDongID");

                entity.Property(e => e.NgayBatDau).HasColumnType("date");

                entity.Property(e => e.NgayKetThuc).HasColumnType("date");

                entity.Property(e => e.PhongTroId).HasColumnName("PhongTroID");

                entity.Property(e => e.TrangThaiHopDong).HasMaxLength(50);

                entity.Property(e => e.UserId).HasColumnName("UserID");

                entity.HasOne(d => d.PhongTro)
                    .WithMany(p => p.HopDongs)
                    .HasForeignKey(d => d.PhongTroId)
                    .HasConstraintName("FK__Hop_Dong__PhongT__4CA06362");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.HopDongs)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__Hop_Dong__UserID__4BAC3F29");
            });

            modelBuilder.Entity<HopDongMau>(entity =>
            {
                entity.ToTable("Hop_Dong_Mau");

                entity.HasIndex(e => e.BaiDangId, "UQ_HopDongMau_BaiDang")
                    .IsUnique();

                entity.Property(e => e.HopDongMauId).HasColumnName("HopDongMauID");

                entity.Property(e => e.BaiDangId).HasColumnName("BaiDangID");

                entity.Property(e => e.FilePdf)
                    .HasMaxLength(500)
                    .HasColumnName("FilePDF");

                entity.Property(e => e.NgayTao)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.BaiDang)
                    .WithOne(p => p.HopDongMau)
                    .HasForeignKey<HopDongMau>(d => d.BaiDangId)
                    .HasConstraintName("FK_HopDongMau_BaiDang");
            });

            modelBuilder.Entity<LienHe>(entity =>
            {
                entity.ToTable("Lien_He");

                entity.Property(e => e.LienHeId).HasColumnName("LienHeID");

                entity.Property(e => e.BaiDangId).HasColumnName("BaiDangID");

                entity.Property(e => e.Email).HasMaxLength(100);

                entity.Property(e => e.HoTen).HasMaxLength(100);

                entity.Property(e => e.NgayLienHe).HasColumnType("date");

                entity.Property(e => e.NoiDung).HasMaxLength(255);

                entity.Property(e => e.Sdt)
                    .HasMaxLength(15)
                    .HasColumnName("SDT");

                entity.Property(e => e.UserId).HasColumnName("UserID");

                entity.HasOne(d => d.BaiDang)
                    .WithMany(p => p.LienHes)
                    .HasForeignKey(d => d.BaiDangId)
                    .HasConstraintName("FK__Lien_He__BaiDang__5441852A");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.LienHes)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__Lien_He__UserID__5535A963");
            });

            modelBuilder.Entity<LyDoTuChoi>(entity =>
            {
                entity.ToTable("Ly_Do_Tu_Choi");

                entity.Property(e => e.LyDoTuChoiId).HasColumnName("LyDoTuChoiID");

                entity.Property(e => e.BaiDangId).HasColumnName("BaiDangID");

                entity.Property(e => e.NgayTuChoi)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.NguoiTuChoi).HasMaxLength(255);

                entity.Property(e => e.NoiDung).HasMaxLength(500);

                entity.HasOne(d => d.BaiDang)
                    .WithMany(p => p.LyDoTuChois)
                    .HasForeignKey(d => d.BaiDangId)
                    .HasConstraintName("FK_LyDoTuChoi_BaiDang");
            });

            modelBuilder.Entity<NguoiDung>(entity =>
            {
                entity.HasKey(e => e.UserId)
                    .HasName("PK__Nguoi_Du__1788CCAC95F320BA");

                entity.ToTable("Nguoi_Dung");

                entity.Property(e => e.UserId).HasColumnName("UserID");

                entity.Property(e => e.Avatar).HasMaxLength(255);

                entity.Property(e => e.Cccd)
                    .HasMaxLength(20)
                    .HasColumnName("CCCD");

                entity.Property(e => e.DiaChi).HasMaxLength(255);

                entity.Property(e => e.Email).HasMaxLength(100);

                entity.Property(e => e.HoTen).HasMaxLength(100);

                entity.Property(e => e.MatKhau).HasMaxLength(255);

                entity.Property(e => e.NgayTaoTaiKhoan)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Role).HasMaxLength(50);

                entity.Property(e => e.Sdt)
                    .HasMaxLength(15)
                    .HasColumnName("SDT");

                entity.Property(e => e.TrangThai).HasMaxLength(50);
            });

            modelBuilder.Entity<PhongTro>(entity =>
            {
                entity.ToTable("Phong_Tro");

                entity.Property(e => e.PhongTroId).HasColumnName("PhongTroID");

                entity.Property(e => e.BaiDangId).HasColumnName("BaiDangID");

                entity.Property(e => e.GiaThue).HasColumnType("decimal(18, 0)");

                entity.Property(e => e.TenPhong).HasMaxLength(100);

                entity.Property(e => e.TrangThaiPhong).HasMaxLength(50);

                entity.HasOne(d => d.BaiDang)
                    .WithMany(p => p.PhongTros)
                    .HasForeignKey(d => d.BaiDangId)
                    .HasConstraintName("FK__Phong_Tro__BaiDa__3C69FB99");
            });

            modelBuilder.Entity<ThanhToan>(entity =>
            {
                entity.ToTable("Thanh_Toan");

                entity.Property(e => e.ThanhToanId).HasColumnName("ThanhToanID");

                entity.Property(e => e.BaiDangId).HasColumnName("BaiDangID");

                entity.Property(e => e.MaGiaoDich).HasMaxLength(100);

                entity.Property(e => e.NgayThanhToan)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.PhuongThuc).HasMaxLength(50);

                entity.Property(e => e.SoTien).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.TrangThai).HasMaxLength(50);

                entity.Property(e => e.UserId).HasColumnName("UserID");

                entity.HasOne(d => d.BaiDang)
                    .WithMany(p => p.ThanhToans)
                    .HasForeignKey(d => d.BaiDangId)
                    .HasConstraintName("FK_ThanhToan_BaiDang");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.ThanhToans)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK_ThanhToan_NguoiDung");
            });

            modelBuilder.Entity<TienIch>(entity =>
            {
                entity.ToTable("Tien_Ich");

                entity.Property(e => e.TienIchId).HasColumnName("TienIchID");

                entity.Property(e => e.TenTienIch).HasMaxLength(100);
            });

            modelBuilder.Entity<TuCam>(entity =>
            {
                entity.ToTable("Tu_Cam");

                entity.Property(e => e.TuCamId).HasColumnName("TuCamID");

                entity.Property(e => e.NoiDung).HasMaxLength(255);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
