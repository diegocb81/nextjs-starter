import { Sparkles, ShieldCheck, Clock, Star } from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';

// Componente de servidor: o conteúdo chega pronto no HTML. Só as animações
// de entrada (Reveal) rodam no navegador.

const services = [
  {
    title: 'Serviço 1',
    description: 'Descrição curta do serviço, focada no benefício para o cliente.',
    icon: <Sparkles className="w-8 h-8" aria-hidden="true" />,
    features: ['Diferencial A', 'Diferencial B', 'Diferencial C']
  },
  {
    title: 'Serviço 2',
    description: 'Descrição curta do serviço, focada no benefício para o cliente.',
    icon: <ShieldCheck className="w-8 h-8" aria-hidden="true" />,
    features: ['Diferencial A', 'Diferencial B', 'Diferencial C']
  },
  {
    title: 'Serviço 3',
    description: 'Descrição curta do serviço, focada no benefício para o cliente.',
    icon: <Clock className="w-8 h-8" aria-hidden="true" />,
    features: ['Diferencial A', 'Diferencial B', 'Diferencial C']
  }
];

export const Services = () => {
  return (
    <section id="servicos" className="pt-12 pb-24 bg-fundo px-8 scroll-mt-20">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-10">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-serif text-marca mb-2">Serviços</h2>
            <p className="text-white/60 uppercase tracking-[0.3em] text-[11px] mb-4">O que oferecemos</p>
            <div className="w-20 h-1 bg-marca mx-auto opacity-50" />
          </Reveal>
        </div>

        {/* Cartões entram em cascata */}
        <RevealGroup stagger={0.2} delayChildren={0.1} amount={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <RevealItem
              key={service.title}
              className="p-8 border border-marca/10 bg-white/2 hover:bg-white/5 transition-all group relative overflow-hidden"
            >
              {/* Linha que surge no hover */}
              <div className="absolute top-0 left-0 w-full h-1 bg-marca transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />

              <div className="text-marca mb-6 group-hover:scale-110 transition-transform duration-500 inline-block">
                {service.icon}
              </div>

              <h3 className="text-xl font-bold text-marca mb-4">{service.title}</h3>

              <p className="text-white/70 font-light leading-relaxed mb-6 text-sm">{service.description}</p>

              <ul className="space-y-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-[11px] text-white/60 uppercase tracking-wider">
                    <Star className="w-3 h-3 text-marca/40" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
};
