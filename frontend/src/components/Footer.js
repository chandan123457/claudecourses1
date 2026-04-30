import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-20 pb-10" id="contact">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="text-2xl font-black tracking-tight mb-6">
              Grad<span className="text-primary">ToPro</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Revolutionizing the way talent is nurtured, validated, and hired in the modern tech landscape.
            </p>
          </div>
          <div>
            <h5 className="font-black uppercase text-xs tracking-widest mb-6">Platform</h5>
            <ul className="space-y-4 text-sm text-gray-600 font-medium">
              <li><span className="hover:text-primary">Certifications</span></li>
              <li><span className="hover:text-primary">Training Programs</span></li>
            <li><span className="hover:text-primary">Mock Interviews</span></li>
            <li><span className="hover:text-primary">Placement Portal</span></li>
            </ul>
          </div>
          <div>
            <h5 className="font-black uppercase text-xs tracking-widest mb-6">Company</h5>
            <ul className="space-y-4 text-sm text-gray-600 font-medium">
              <li><Link className="hover:text-primary transition-colors" to="/about-us">About Us</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/">Mentors</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/terms-of-service">Terms of Service</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-black uppercase text-xs tracking-widest mb-6">Social</h5>
            <div className="flex gap-4">
              <button
                type="button"
                aria-label="Social links coming soon"
                title="Social links coming soon"
                className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-gray-500"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z">
                  </path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
