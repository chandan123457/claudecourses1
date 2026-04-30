import React from 'react';

const InfoPageLayout = ({ title, intro, lastUpdated, sections }) => {

  return (
    <section className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-black tracking-tight text-secondary sm:text-5xl">
              {title}
            </h1>
            {lastUpdated ? (
              <p className="mt-6 text-base font-medium text-gray-600">
                Last Updated At: <span className="text-secondary">{lastUpdated}</span>
              </p>
            ) : null}
            {intro ? (
              <p className="mt-8 text-left text-lg leading-9 text-gray-700">
                {intro}
              </p>
            ) : null}
          </div>

          <div className="space-y-10 text-left">
            {sections.map((section, sectionIndex) => (
              <section key={section.heading || `section-${sectionIndex}`}>
                {section.heading ? (
                  <h2 className="text-2xl font-bold tracking-tight text-secondary">
                    {section.heading}
                  </h2>
                ) : null}

                <div className={`${section.heading ? 'mt-4' : ''} space-y-5 text-lg leading-9 text-gray-700`}>
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={`${section.heading || 'section'}-paragraph-${paragraphIndex}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.items?.length ? (
                  section.ordered ? (
                    <ol className="mt-5 list-decimal space-y-3 pl-6 text-lg leading-9 text-gray-700 marker:text-secondary">
                      {section.items.map((item, itemIndex) => (
                        <li key={`${section.heading || 'section'}-item-${itemIndex}`}>{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <ul className="mt-5 list-disc space-y-3 pl-6 text-lg leading-9 text-gray-700 marker:text-secondary">
                      {section.items.map((item, itemIndex) => (
                        <li key={`${section.heading || 'section'}-item-${itemIndex}`}>{item}</li>
                      ))}
                    </ul>
                  )
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoPageLayout;
