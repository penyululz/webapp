package main

import (
	"log"

	"github.com/wneessen/go-mail"
)

func main() {
	m := mail.NewMsg()
	if err := m.From("faris@modlabcoaching.com"); err != nil {
		log.Fatalf("failed to set From address: %s", err)
	}
	if err := m.To("arep@modlabcoaching.com"); err != nil {
		log.Fatalf("failed to set To address: %s", err)
	}
	m.Subject("This is my first mail with go-mail!")
	m.SetBodyString(mail.TypeTextPlain, "Do you like this mail? I certainly do!")
	c, err := mail.NewClient("smtp.mailgun.org", mail.WithPort(587), mail.WithSMTPAuth(mail.SMTPAuthPlain),
		mail.WithUsername("postmaster@modlabcoaching.com"), mail.WithPassword("F@risdanial196210"))
	if err != nil {
		log.Fatalf("failed to create mail client: %s", err)
	}
	if err := c.DialAndSend(m); err != nil {
		log.Fatalf("failed to send mail: %s", err)
	}
}
