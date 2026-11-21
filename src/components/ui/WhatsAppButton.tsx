'use client'
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { CONTACT } from '@/lib/site';

export default function WhatsAppButton() {
  return (
    // "whatsapp-flutuante": no celular, o globals.css esconde o botão enquanto
    // um campo de formulário está em foco (o teclado virtual o jogaria sobre o campo)
    <div className="whatsapp-flutuante fixed bottom-6 right-6 z-50">
      {/* Aura Verde Pulsante */}
      <div aria-hidden="true" className="absolute inset-0 bg-[#25D366] rounded-full blur-md animate-aura-strong" />

      {/* Botão Principal */}
      <motion.a
        href={CONTACT.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        // O link só tem um ícone: sem aria-label o leitor de tela anunciaria apenas "link"
        aria-label="Conversar pelo WhatsApp (abre em nova aba)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative bg-[#25D366] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-[#128C7E] transition-colors overflow-hidden"
      >
        <FaWhatsapp size={30} aria-hidden="true" />
      </motion.a>
    </div>
  );
}
