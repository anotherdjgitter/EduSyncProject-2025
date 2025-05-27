using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace EduSync.API.Data
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseMySql(
                "server=localhost;port=3306;database=new_edusyncdb;user=root;password=Dj@09082003",
                ServerVersion.AutoDetect("server=localhost;port=3306;database=new_edusyncdb;user=root;password=Dj@09082003")
            );
            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
} 