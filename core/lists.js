(() => {
  const S = d => '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const I = [
    ['phone', 'موبايلات', 'Phones', '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 5h3"/>'],
    ['iphone', 'آيفون', 'iPhone', '<rect x="5.5" y="2.5" width="13" height="19" rx="3.5"/><rect x="7.8" y="4.8" width="4.6" height="4.6" rx="1.3"/><circle cx="9.1" cy="6.1" r=".5"/><circle cx="11.1" cy="8.1" r=".5"/>'],
    ['case', 'جرابات', 'Cases', '<rect x="5.5" y="2" width="13" height="20" rx="3.5"/><rect x="8" y="4.5" width="4.5" height="4.5" rx="1.2"/><circle cx="12" cy="14.5" r="2.6"/>'],
    ['shield', 'اسكرينات حماية', 'Screen protectors', '<path d="M12 3l7 3v5c0 4.6-3 8.3-7 10-4-1.7-7-5.4-7-10V6z"/><path d="M9 12l2 2 4-4"/>'],
    ['tablet', 'تابلت', 'Tablets', '<rect x="4" y="2.5" width="16" height="19" rx="2.5"/><path d="M11 18.5h2"/>'],
    ['laptop', 'لابتوب', 'Laptops', '<rect x="4.5" y="4.5" width="15" height="10.5" rx="1.5"/><path d="M2.5 18.5h19"/>'],
    ['watch', 'ساعات', 'Watches', '<rect x="6" y="6" width="12" height="12" rx="3.5"/><path d="M9 6l.6-3.5h4.8L15 6M9 18l.6 3.5h4.8L15 18M12 9.5V12l1.6 1"/>'],
    ['earbuds', 'سماعات لاسلكي', 'Earbuds', '<path d="M8 4a3 3 0 0 0-3 3v1a3 3 0 0 0 3 3h1V4zM16 4a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1V4zM9 11v8M15 11v8"/>'],
    ['headphones', 'هيدفون', 'Headphones', '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3.5" y="14" width="4" height="6.5" rx="1.5"/><rect x="16.5" y="14" width="4" height="6.5" rx="1.5"/>'],
    ['charger', 'شواحن', 'Chargers', '<rect x="6" y="7" width="12" height="10" rx="2.5"/><path d="M9.5 7V3.5M14.5 7V3.5M12 17v4"/><path d="M12.6 9.5l-2 2.6h2.8l-2 2.4"/>'],
    ['cable', 'كابلات', 'Cables', '<path d="M7 3v4M11 3v4"/><rect x="5.5" y="7" width="7" height="5" rx="1.5"/><path d="M9 12v3a4 4 0 0 0 4 4h2a3 3 0 0 0 3-3V6"/><path d="M18 6V3"/>'],
    ['battery', 'باور بانك', 'Power banks', '<rect x="3" y="7" width="16" height="10" rx="2.5"/><path d="M21 10.5v3"/><path d="M11.5 9l-2.5 3.2h3.4L10 15"/>'],
    ['speaker', 'سبيكرات', 'Speakers', '<rect x="6" y="2.5" width="12" height="19" rx="3"/><circle cx="12" cy="14.5" r="3.5"/><circle cx="12" cy="7" r="1.2"/>'],
    ['camera', 'كاميرات', 'Cameras', '<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13.2" r="3.3"/>'],
    ['game', 'ألعاب', 'Gaming', '<path d="M7 8h10a4 4 0 0 1 4 4.4l-.5 3.6a2.5 2.5 0 0 1-4.3 1.3L14.5 15h-5l-1.7 2.3a2.5 2.5 0 0 1-4.3-1.3L3 12.4A4 4 0 0 1 7 8z"/><path d="M7.5 11.5v2.5M6.3 12.7h2.5M16 12h.01M18 13.5h.01"/>'],
    ['car', 'إكسسوارات عربية', 'Car accessories', '<path d="M5 16l1.4-5.2A2 2 0 0 1 8.3 9.3h7.4a2 2 0 0 1 1.9 1.5L19 16"/><rect x="3.5" y="15.5" width="17" height="4" rx="1.5"/><path d="M6.5 19.5v1.5M17.5 19.5v1.5"/>'],
    ['memory', 'كروت ميموري', 'Memory cards', '<path d="M7 3h7l4 4v14H7z"/><path d="M10 3v3M12.5 3v3M15 4v3"/>'],
    ['sim', 'شرايح', 'SIM cards', '<path d="M6 3h8l4 4v14H6z"/><rect x="9" y="11" width="6" height="6" rx="1"/>'],
    ['stand', 'استاندات', 'Stands', '<rect x="8" y="3" width="8" height="12" rx="2"/><path d="M12 15v4M7 21h10"/>'],
    ['repair', 'صيانة', 'Repairs', '<path d="M14.5 6.5a4 4 0 0 0 5 5l-8.6 8.6a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/>'],
    ['used', 'مستعمل', 'Used', '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>'],
    ['offer', 'عروض', 'Offers', '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/><path d="M10 15l5-5"/>'],
    ['new', 'جديد', 'New', '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>'],
    ['star', 'مميز', 'Featured', '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'],
    ['gift', 'هدايا', 'Gifts', '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8.5h14V12M12 8v12.5M12 8C10.5 5 7 4.5 7 6.5S10 8 12 8zM12 8c1.5-3 5-3.5 5-1.5S14 8 12 8z"/>'],
    ['bag', 'منتجات تانية', 'Other', '<path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>']
  ];
  const ICONS = {};
  I.forEach(([k, ar, en, d]) => { ICONS[k] = { ar, en, svg: S(d) }; });
  const GOV = [
    ['القاهرة', 'Cairo'], ['الجيزة', 'Giza'], ['الإسكندرية', 'Alexandria'], ['القليوبية', 'Qalyubia'], ['الشرقية', 'Sharqia'],
    ['الدقهلية', 'Dakahlia'], ['الغربية', 'Gharbia'], ['المنوفية', 'Monufia'], ['البحيرة', 'Beheira'], ['كفر الشيخ', 'Kafr El Sheikh'],
    ['دمياط', 'Damietta'], ['بورسعيد', 'Port Said'], ['الإسماعيلية', 'Ismailia'], ['السويس', 'Suez'], ['الفيوم', 'Faiyum'],
    ['بني سويف', 'Beni Suef'], ['المنيا', 'Minya'], ['أسيوط', 'Asyut'], ['سوهاج', 'Sohag'], ['قنا', 'Qena'],
    ['الأقصر', 'Luxor'], ['أسوان', 'Aswan'], ['البحر الأحمر', 'Red Sea'], ['الوادي الجديد', 'New Valley'], ['مطروح', 'Matrouh'],
    ['شمال سيناء', 'North Sinai'], ['جنوب سيناء', 'South Sinai']
  ];
  const parseShip = s => {
    const out = [];
    String(s || '').split(/[|\n]+/).forEach(x => {
      const i = x.lastIndexOf('='); const n = (i === -1 ? x : x.slice(0, i)).trim();
      if (!n) return;
      const f = i === -1 ? 0 : Number(String(x.slice(i + 1)).replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632)).replace(/[^\d.]/g, ''));
      out.push({ name: n, fee: isFinite(f) && f > 0 ? f : 0 });
    });
    return out;
  };
  window.MK_LISTS = { ICONS, GOV, parseShip };
})();
