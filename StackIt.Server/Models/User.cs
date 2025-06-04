using System.ComponentModel.DataAnnotations;

namespace StackIt.Server.Models
{
    public class User
    {
        [Key] // Indica che questa proprietà è la chiave primaria
        public int Id { get; set; }

        [Required] // Campo obbligatorio
        [MaxLength(100)] // Lunghezza massima 100 caratteri
        public string FirstName { get; set; }

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress] // Valida che sia una mail
        public string Email { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
