import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img alt="Industry Collaboration and Mentorship" className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBK79kR9uW9E6G9y5B9U_9kK3H9L6vP8jR_6yR9U7M5G9y5B9U_9kK3H9L6vP8jR_6yR9U7M5G9y5B9U_9kK3H9L6vP8jR_6yR9U7M" />
        <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 hero-gradient"></div>
      </div>
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-12 lg:left-12 float-slow">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 max-w-[200px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path clipRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    fillRule="evenodd"></path>
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Project Audit</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[85%]"></div>
            </div>
            <p className="mt-2 text-[10px] font-semibold text-secondary">85% Industry Ready Score</p>
          </div>
        </div>
        <div className="absolute bottom-1/4 -right-12 lg:right-24 float-animation">
          <div className="bg-secondary text-white p-4 rounded-2xl shadow-2xl border border-white/10 max-w-[180px]">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-secondary font-bold text-xs">
                SV</div>
              <div>
                <p className="text-[10px] font-bold">Sarah Vance</p>
                <p className="text-[8px] text-gray-400">Software Engineer</p>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="h-1 flex-1 bg-primary rounded-full"></div>
              <div className="h-1 flex-1 bg-primary rounded-full"></div>
              <div className="h-1 flex-1 bg-primary rounded-full"></div>
              <div className="h-1 flex-1 bg-white/20 rounded-full"></div>
            </div>
            <p className="mt-2 text-[9px] text-gray-300 italic">"The mentorship changed my career trajectory."</p>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute top-1/3 right-10 lg:right-48 float-slow hidden md:block">
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/40 max-w-[220px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z">
                  </path>
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-gray-400">Mentor Feedback</span>
            </div>
            <p className="text-[11px] leading-relaxed text-secondary font-medium">"Clean architectural patterns. Ready for
              Senior roles."</p>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-gray-200"></div>
              <span className="text-[9px] text-gray-500 font-semibold">Principal Eng @ AWS</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-1/3 left-4 lg:left-32 float-animation hidden md:block">
          <div
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-primary/20">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-3 h-3 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z">
                </path>
              </svg>
            </div>
            <span className="text-xs font-black text-secondary uppercase tracking-wider">System Design</span>
          </div>
        </div>
        <div className="absolute top-[15%] left-[10%] w-4 h-4 rounded-full bg-primary/20 blur-sm"></div>
        <div className="absolute bottom-[20%] right-[15%] w-8 h-8 rounded-full bg-primary/10 blur-md"></div>
        <div className="absolute top-1/2 left-[5%] grid grid-cols-2 gap-2 opacity-30">
          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
        </div>
        <div className="absolute top-[40%] right-[5%] w-12 h-12 border-2 border-primary/10 rounded-full"></div>
      </div>
      <div className="container mx-auto px-6 relative z-20 py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl lg:text-8xl font-black leading-[1.1] text-secondary tracking-tight">
            Become Industry-Ready. <br />
            <span className="text-primary relative inline-block">
              Not Just Certified.
              <svg className="absolute -bottom-2 left-0 w-full" fill="none" height="12" viewBox="0 0 440 12"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8C48.6667 4.66667 172.4 -0.800001 436 8" stroke="#E4B61A" strokeLinecap="round"
                  strokeWidth="8"></path>
              </svg>
            </span>
          </h1>
          <div className="inline-block px-6 py-3 bg-secondary text-primary font-black text-sm rounded-full uppercase tracking-wider shadow-lg">
            🚀 Start Your Journey Today
          </div>
          <p className="text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed text-gray-700 font-medium">
            The bridge between academic theory and professional mastery. Gain real-world experience through
            project-based validation and mentorship from top industry engineers.
          </p>
          <div className="flex flex-wrap justify-center gap-5 pt-4">
            <button type="button" className="bg-primary text-secondary px-10 py-5 rounded-2xl font-black text-lg shadow-[0_10px_20px_-5px_rgba(228,182,26,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(228,182,26,0.5)] transition-all hover:-translate-y-1 active:scale-95 cursor-pointer"
              onClick={(e) => {
                const element = document.querySelector('#training');
                if (element) {
                  const headerOffset = 80;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}>Explore Programs</button>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
