import React from 'react';

function Footer() {
  return (
    <div className="w-screen">
      <div className="flex justify-between items-start bg-[#ebeeef] p-4 flex-wrap gap-6">
        <div>
          <p className="text-xl font-bold mb-2">POPULAR LOCATIONS</p>
          <ul className="space-y-1">
            <li>Kolkata</li>
            <li>Mumbai</li>
            <li>Chennai</li>
            <li>Pune</li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-bold mb-2">ABOUT US</p>
          <ul className="space-y-1">
            <li>About OLX Group</li>
            <li>Careers</li>
            <li>Contact Us</li>
            <li>OLXPeople</li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-bold mb-2">OLX</p>
          <ul className="space-y-1">
            <li>Help</li>
            <li>Sitemap</li>
            <li>Legal & Privacy information</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between items-center p-4 bg-[#002f34] text-white text-sm flex-wrap gap-2">
        <p>Other Countries: Pakistan - South Africa - Indonesia</p>
        <p>Free Classifieds in India. © 2006-2021 OLX</p>
      </div>
    </div>
  );
}

export default Footer;
