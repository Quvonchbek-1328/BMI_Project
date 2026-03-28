using Microsoft.EntityFrameworkCore;
using RiskWatch.Api.Entities;

namespace RiskWatch.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTask> ProjectTasks => Set<ProjectTask>();
    public DbSet<RiskMetric> RiskMetrics => Set<RiskMetric>();
    public DbSet<Prediction> Predictions => Set<Prediction>();
    public DbSet<Recommendation> Recommendations => Set<Recommendation>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ─── User ───
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.FullName).HasMaxLength(150).IsRequired();
            e.Property(u => u.Email).HasMaxLength(256).IsRequired();
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.PasswordHash).HasMaxLength(512).IsRequired();
        });

        // ─── Role ───
        modelBuilder.Entity<Role>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Name).HasMaxLength(50).IsRequired();
            e.HasIndex(r => r.Name).IsUnique();

            // Seed roles
            e.HasData(
                new Role { Id = 1, Name = "Admin" },
                new Role { Id = 2, Name = "ProjectManager" },
                new Role { Id = 3, Name = "TeamMember" }
            );
        });

        // ─── UserRole (many-to-many) ───
        modelBuilder.Entity<UserRole>(e =>
        {
            e.HasKey(ur => new { ur.UserId, ur.RoleId });
            e.HasOne(ur => ur.User).WithMany(u => u.UserRoles).HasForeignKey(ur => ur.UserId);
            e.HasOne(ur => ur.Role).WithMany(r => r.UserRoles).HasForeignKey(ur => ur.RoleId);
        });

        // ─── Project ───
        modelBuilder.Entity<Project>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Name).HasMaxLength(200).IsRequired();
            e.Property(p => p.Status).HasMaxLength(50).IsRequired();
            e.Property(p => p.Budget).HasColumnType("decimal(18,2)");
            e.HasOne(p => p.Owner).WithMany(u => u.OwnedProjects).HasForeignKey(p => p.OwnerId);
        });

        // ─── ProjectTask ───
        modelBuilder.Entity<ProjectTask>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Title).HasMaxLength(300).IsRequired();
            e.Property(t => t.Status).HasMaxLength(50).IsRequired();
            e.Property(t => t.Priority).HasMaxLength(20).IsRequired();
            e.Property(t => t.EstimatedHours).HasColumnType("decimal(8,2)");
            e.Property(t => t.ActualHours).HasColumnType("decimal(8,2)");
            e.HasOne(t => t.Project).WithMany(p => p.Tasks).HasForeignKey(t => t.ProjectId);
            e.HasOne(t => t.Assignee).WithMany(u => u.AssignedTasks).HasForeignKey(t => t.AssigneeId);
        });

        // ─── RiskMetric ───
        modelBuilder.Entity<RiskMetric>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasOne(r => r.Project).WithMany(p => p.RiskMetrics).HasForeignKey(r => r.ProjectId);
            e.HasOne(r => r.Task).WithMany(t => t.RiskMetrics).HasForeignKey(r => r.TaskId);
        });

        // ─── Prediction ───
        modelBuilder.Entity<Prediction>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasOne(p => p.Project).WithMany(p2 => p2.Predictions).HasForeignKey(p => p.ProjectId);
            e.HasOne(p => p.Task).WithMany(t => t.Predictions).HasForeignKey(p => p.TaskId);
            e.HasOne(p => p.RiskMetric).WithMany(r => r.Predictions).HasForeignKey(p => p.RiskMetricId);
            e.HasOne(p => p.RequestedBy).WithMany().HasForeignKey(p => p.RequestedById);
            e.Property(p => p.RiskLevel).HasMaxLength(20);
        });

        // ─── Recommendation ───
        modelBuilder.Entity<Recommendation>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Text).HasMaxLength(500).IsRequired();
            e.HasOne(r => r.Prediction).WithMany(p => p.Recommendations).HasForeignKey(r => r.PredictionId);
        });

        // ─── Alert ───
        modelBuilder.Entity<Alert>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.Title).HasMaxLength(300).IsRequired();
            e.Property(a => a.Severity).HasMaxLength(20).IsRequired();
            e.HasOne(a => a.Project).WithMany(p => p.Alerts).HasForeignKey(a => a.ProjectId);
            e.HasOne(a => a.Task).WithMany().HasForeignKey(a => a.TaskId);
            e.HasOne(a => a.Prediction).WithMany().HasForeignKey(a => a.PredictionId);
            e.HasOne(a => a.User).WithMany(u => u.Alerts).HasForeignKey(a => a.UserId);
        });

        // ─── ActivityLog ───
        modelBuilder.Entity<ActivityLog>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.Action).HasMaxLength(100).IsRequired();
            e.Property(a => a.EntityType).HasMaxLength(50).IsRequired();
            e.HasOne(a => a.User).WithMany(u => u.ActivityLogs).HasForeignKey(a => a.UserId);
        });
    }
}
