import { FiHeart, FiStar, FiUsers, FiAward } from 'react-icons/fi'
import { useStoreSettings } from '../../contexts/StoreSettingsContext'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

export default function AboutPage() {
  const { settings } = useStoreSettings()

  const hasAboutContent = settings?.aboutContent && settings.aboutContent.trim().length > 0

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-green to-brand-green/70 text-white py-16 md:py-24 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-[15%] w-20 h-20 rounded-full border-2 border-white/10 animate-float" />
          <div className="absolute bottom-1/3 left-[20%] w-12 h-12 rounded-full bg-white/5 animate-float-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/5 animate-spin-slow" />
          <svg className="absolute top-0 left-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 1000">
            <circle cx="200" cy="200" r="80" fill="white" />
            <circle cx="800" cy="300" r="60" fill="white" />
            <circle cx="500" cy="800" r="70" fill="white" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Nossa Essencia</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Conheca a historia e os valores que fazem da Embeleze uma referencia em flores e plantas
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 bg-white relative">
        {/* Wave divider */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -translate-y-[1px]">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[40px] md:h-[60px]">
            <path d="M0,0 C300,90 900,90 1200,0 L1200,0 L0,0 Z" fill="#48bb78" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {hasAboutContent ? (
            /* Dynamic content from admin settings */
            <div
              className="prose prose-lg max-w-none text-text-medium leading-relaxed [&_h1]:text-text-dark [&_h1]:font-bold [&_h2]:text-text-dark [&_h2]:font-bold [&_h3]:text-text-dark [&_h3]:font-semibold [&_a]:text-brand-blue [&_a]:underline [&_strong]:text-text-dark [&_img]:rounded-2xl [&_img]:shadow-md"
              dangerouslySetInnerHTML={{ __html: settings!.aboutContent! }}
            />
          ) : (
            /* Default fallback content */
            <DefaultAboutContent />
          )}
        </div>
      </section>

      {/* Values section */}
      <ValuesSection />

      {/* Timeline section */}
      <TimelineSection />
    </div>
  )
}

function ValuesSection() {
  const { ref, isVisible } = useScrollAnimation()

  const values = [
    {
      icon: <FiHeart className="w-7 h-7" />,
      title: 'Paixao',
      description: 'Amamos o que fazemos e isso se reflete em cada arranjo que criamos.',
      color: 'bg-brand-pink/10 text-brand-pink',
    },
    {
      icon: <FiStar className="w-7 h-7" />,
      title: 'Qualidade',
      description: 'Selecionamos apenas as melhores flores e plantas para nossos clientes.',
      color: 'bg-brand-yellow/10 text-brand-yellow',
    },
    {
      icon: <FiUsers className="w-7 h-7" />,
      title: 'Dedicacao',
      description: 'Cada cliente e unico e merece atendimento personalizado e atencioso.',
      color: 'bg-brand-blue/10 text-brand-blue',
    },
    {
      icon: <FiAward className="w-7 h-7" />,
      title: 'Tradicao',
      description: 'Mais de 20 anos de experiencia trazendo beleza e emocao.',
      color: 'bg-brand-green/10 text-brand-green',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4 heading-ornament">
            Nossos Valores
          </h2>
          <p className="text-text-medium max-w-2xl mx-auto mt-6">
            Os pilares que sustentam nosso compromisso com a excelencia
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, i) => (
            <div
              key={value.title}
              className={`card-top-accent bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${value.color}`}
              >
                {value.icon}
              </div>
              <h3 className="text-lg font-bold text-text-dark mb-2">{value.title}</h3>
              <p className="text-sm text-text-medium leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TimelineSection() {
  const { ref, isVisible } = useScrollAnimation()

  const timelineItems = [
    {
      year: '2000s',
      title: 'O Inicio',
      description: 'Nascemos do sonho de levar beleza e alegria atraves das flores para Tres de Maio e regiao.',
    },
    {
      year: '2010s',
      title: 'Crescimento',
      description: 'Ampliamos nosso catalogo com arranjos exclusivos, plantas ornamentais e presentes especiais.',
    },
    {
      year: 'Hoje',
      title: 'Referencia Regional',
      description: 'Somos reconhecidos pela qualidade, criatividade e atendimento personalizado que oferecemos a cada cliente.',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4 heading-ornament">
            Nossa Trajetoria
          </h2>
        </div>

        <div
          ref={ref}
          className="relative space-y-8 before:absolute before:left-[2.5rem] before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-brand-blue before:to-brand-pink"
        >
          {timelineItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex gap-6 items-start animate-on-scroll animate-from-left ${isVisible ? 'animate-visible' : ''}`}
              style={{ transitionDelay: `${idx * 200}ms` }}
            >
              <div className="shrink-0 w-20 text-center relative z-10">
                <span className="inline-block bg-brand-blue text-white text-sm font-bold px-3 py-1.5 rounded-full ring-4 ring-brand-blue/20">
                  {item.year}
                </span>
              </div>
              <div className="flex-1 bg-brand-bg rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold text-text-dark mb-2">{item.title}</h3>
                <p className="text-sm text-text-medium leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DefaultAboutContent() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-green/10 mb-6">
          <span className="text-4xl">🌿</span>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-text-dark text-center">
        Floricultura Embeleze
      </h2>

      <p className="text-text-medium leading-relaxed text-center text-lg">
        Ha mais de 20 anos, a Floricultura Embeleze tem a missao de transformar momentos
        especiais em memorias inesqueciveis atraves da beleza e do frescor das flores.
      </p>

      <p className="text-text-medium leading-relaxed">
        Localizada em Tres de Maio, no Rio Grande do Sul, nossa floricultura nasceu do
        amor pelas flores e do desejo de levar alegria e emocao para cada cliente. Ao
        longo dessas duas decadas, nos tornamos referencia em arranjos florais, buques,
        plantas ornamentais e presentes especiais para todas as ocasioes.
      </p>

      <p className="text-text-medium leading-relaxed">
        Nossa equipe e formada por profissionais apaixonados e dedicados, que trabalham
        com carinho e criatividade para criar arranjos unicos que refletem os sentimentos
        de quem presenteia. Cada composicao e pensada nos minimos detalhes, desde a
        selecao das flores ate a finalizacao do arranjo.
      </p>

      <p className="text-text-medium leading-relaxed">
        Acreditamos que as flores tem o poder de embelezar ambientes, transmitir
        sentimentos e tornar qualquer momento mais especial. Por isso, nos dedicamos
        diariamente a oferecer o melhor em qualidade, variedade e atendimento
        personalizado.
      </p>
    </div>
  )
}
