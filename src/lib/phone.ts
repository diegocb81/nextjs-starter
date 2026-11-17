// Máscara de telefone brasileiro aplicada enquanto a pessoa digita.
//   celular (11 dígitos): (48) 99999-9999
//   fixo    (10 dígitos): (48) 3333-4444
// Enquanto o número está incompleto, usa o formato de fixo e troca para o de
// celular ao chegar no 11º dígito (padrão comum em sites brasileiros).
export function formatTelefone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 3) return digits;

  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);

  if (number.length <= 4) return `(${ddd}) ${number}`;

  const split = digits.length === 11 ? 5 : 4;
  return `(${ddd}) ${number.slice(0, split)}-${number.slice(split)}`;
}
