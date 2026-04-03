import React from 'react';

const TrainingPrograms = () => {
  const handleLearnMore = (e) => {
    e.preventDefault();
    const element = document.querySelector('#coming-soon');
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24" id="training">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">Comprehensive Training Courses</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Master the most in-demand domains with hands-on, expert-led
            training.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group bg-white p-2 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
            <div className="h-48 overflow-hidden rounded-2xl mb-6">
              <img alt="AI Program" className="w-full h-full object-cover"
                src="/AI.jpg" />
            </div>
            <div className="px-6 pb-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Artificial Intelligence</h3>
              <p className="text-gray-500 text-sm mb-4 flex-1">Deep learning, NLP, and Computer Vision for real-world apps.</p>
              <button 
                onClick={handleLearnMore}
                className="w-full bg-primary text-secondary px-4 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
                Learn More
              </button>
            </div>
          </div>
          <div className="group bg-white p-2 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
            <div className="h-48 overflow-hidden rounded-2xl mb-6">
              <img alt="Full Stack" className="w-full h-full object-cover"
                src="/FullStack.jpg" />
            </div>
            <div className="px-6 pb-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Full Stack Development</h3>
              <p className="text-gray-500 text-sm mb-4 flex-1">Modern MERN stack with scalable architectural patterns.</p>
              <button 
                onClick={handleLearnMore}
                className="w-full bg-primary text-secondary px-4 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
                Learn More
              </button>
            </div>
          </div>
          <div className="group bg-white p-2 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
            <div className="h-48 overflow-hidden rounded-2xl mb-6">
              <img alt="Robotics" className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTJj3_tFNy8mlBizN7uSGpCBstH8LXCjhdesTIZTGZ-MAb9fLJK2oM6c04XEU7iuvWs4QUtjIwLFRp6m_4AXr3lZKDF4NY2c7I0XdbmARBURasUJvIoSa0Y59lI-MRK96pcSsO_H72-HZzjjAHuDH9HSJ9VDxDikUaiE7NhILZd1ntRur-5YFxh__nnfnWNJ98WpCgjZ2GyH5CLEKCtKdD0JrOHQ5xbc9gluHSVH01qjz4EfDbZBcAeYvcSWjnSLTzAKnJXjn-u7U" />
            </div>
            <div className="px-6 pb-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Robotics &amp; Edge AI</h3>
              <p className="text-gray-500 text-sm mb-4 flex-1">Programming hardware and optimizing models for edge devices.</p>
              <button 
                onClick={handleLearnMore}
                className="w-full bg-primary text-secondary px-4 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
                Learn More
              </button>
            </div>
          </div>
          <div className="group bg-white p-2 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
            <div className="h-48 overflow-hidden rounded-2xl mb-6">
              <img alt="AI Tools" className="w-full h-full object-cover"
                src="/AITools.jpeg" />
            </div>
            <div className="px-6 pb-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-2">AI Productivity Tools</h3>
              <p className="text-gray-500 text-sm mb-4 flex-1">Leveraging LLMs and automation to 10x your workflow.</p>
              <button 
                onClick={handleLearnMore}
                className="w-full bg-primary text-secondary px-4 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrainingPrograms;
