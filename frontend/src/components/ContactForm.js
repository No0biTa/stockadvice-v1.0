import React, { useRef } from "react";
import emailjs from "@emailjs/browser";

const ContactForm = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm(
      "YOUR_SERVICE_ID",     // Ganti dengan ID dari EmailJS
      "YOUR_TEMPLATE_ID",    // Ganti dengan template ID
      form.current,
      "YOUR_PUBLIC_KEY"      // Ganti dengan public key
    ).then(
      (result) => {
        alert("Pesan berhasil dikirim!");
        console.log(result.text);
      },
      (error) => {
        alert("Gagal mengirim pesan.");
        console.log(error.text);
      }
    );

    e.target.reset(); // reset form setelah submit
  };

  return (
    <form ref={form} onSubmit={sendEmail}>
      <label>Nama</label>
      <input type="text" name="user_name" required />

      <label>Email</label>
      <input type="email" name="user_email" required />

      <label>Pesan</label>
      <textarea name="message" required />

      <button type="submit">Kirim Pesan</button>
    </form>
  );
};

export default ContactForm;
