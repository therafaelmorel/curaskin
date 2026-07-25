const products = [
  { id:'gentle-cleanser', name:'Gentle Cleanser', price:38, size:'200 ml', category:'Cleanse', image:'./assets/gentle-cleanser.jpg', description:'A low-foam botanical cleanser that removes impurities while preserving the skin’s natural moisture barrier.' },
  { id:'radiance-serum', name:'Radiance Serum', price:72, size:'30 ml', category:'Treat', image:'./assets/radiance-serum.jpg', description:'A concentrated antioxidant serum that visibly brightens, supports elasticity, and restores an even appearance.' },
  { id:'soothing-cream', name:'Soothing Cream', price:58, size:'50 ml', category:'Hydrate', image:'./assets/soothing-cream.jpg', description:'A comforting daily moisturizer with ceramides and calming botanicals for soft, balanced, resilient skin.' },
  { id:'daily-spf', name:'Daily SPF', price:36, size:'50 ml', category:'Protect', image:'./assets/daily-spf.jpg', description:'A lightweight broad-spectrum mineral sunscreen that protects without residue, fragrance, or heaviness.' },
  { id:'cream-cleanser', name:'Cream Cleanser', price:42, size:'100 ml', category:'Cleanse', image:'./assets/hero-cura.jpg', description:'A cushiony cream cleanser with amino acids and squalane, created for dry, delicate, or sensitized skin.' }
];

const productGrid = document.querySelector('#productGrid');
const cartDrawer = document.querySelector('#cartDrawer');
const cartItems = document.querySelector('#cartItems');
const cartFooter = document.querySelector('#cartFooter');
const emptyCart = document.querySelector('#emptyCart');
const scrim = document.querySelector('#scrim');
const toast = document.querySelector('#toast');
const cart = new Map();
let activeProduct = null;

function money(value){ return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value); }
function renderProducts(list = products.slice(0,4)){
  productGrid.innerHTML = list.map(p => `
    <article class="product-card reveal" data-id="${p.id}">
      <div class="product-image-wrap" data-open-product="${p.id}" tabindex="0" role="button" aria-label="View ${p.name}">
        <img src="${p.image}" alt="CURA ${p.name}" />
        <button class="quick-add" data-add="${p.id}">Add to cart</button>
      </div>
      <div class="product-meta">
        <div class="product-title"><h3>${p.name}</h3><span>${money(p.price)}</span></div>
        <p>${p.category} · ${p.size}</p>
      </div>
    </article>
  `).join('');
  observeReveals();
}
function showToast(message){ toast.textContent = message; toast.classList.add('visible'); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove('visible'),2200); }
function addToCart(id){
  cart.set(id,(cart.get(id)||0)+1);
  updateCart();
  showToast(`${products.find(p=>p.id===id).name} added to cart`);
}
function updateCart(){
  const count=[...cart.values()].reduce((a,b)=>a+b,0);
  document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=count);
  const entries=[...cart.entries()];
  emptyCart.style.display=entries.length?'none':'flex';
  cartFooter.style.display=entries.length?'block':'none';
  cartItems.innerHTML=entries.map(([id,qty])=>{
    const p=products.find(x=>x.id===id);
    return `<div class="cart-item">
      <img src="${p.image}" alt="${p.name}" />
      <div><h3>${p.name}</h3><p>${p.size}</p><div class="quantity"><button data-qty="minus" data-id="${id}" aria-label="Decrease quantity">−</button><span>${qty}</span><button data-qty="plus" data-id="${id}" aria-label="Increase quantity">+</button></div></div>
      <span class="cart-item-price">${money(p.price*qty)}</span>
    </div>`;
  }).join('');
  const subtotal=entries.reduce((sum,[id,qty])=>sum+products.find(p=>p.id===id).price*qty,0);
  document.querySelector('#cartSubtotal').textContent=money(subtotal);
}
function setDrawer(open){
  cartDrawer.classList.toggle('open',open); cartDrawer.setAttribute('aria-hidden',String(!open)); scrim.classList.toggle('visible',open); document.body.classList.toggle('no-scroll',open);
}
function openProduct(id){
  const p=products.find(x=>x.id===id); activeProduct=p;
  document.querySelector('#modalImage').src=p.image; document.querySelector('#modalImage').alt=`CURA ${p.name}`;
  document.querySelector('#modalCategory').textContent=p.category; document.querySelector('#modalName').textContent=p.name;
  document.querySelector('#modalSize').textContent=p.size; document.querySelector('#modalDescription').textContent=p.description;
  document.querySelector('#modalPrice').textContent=money(p.price); document.querySelector('#productModal').showModal();
}
function setSearch(open){
  const el=document.querySelector('#searchOverlay'); el.classList.toggle('open',open); el.setAttribute('aria-hidden',String(!open)); document.body.classList.toggle('no-scroll',open);
  if(open){ setTimeout(()=>document.querySelector('#searchInput').focus(),400); renderSearch(''); }
}
function renderSearch(query){
  const q=query.toLowerCase().trim(); const result=products.filter(p=>!q || `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q));
  document.querySelector('#searchResults').innerHTML=result.map(p=>`<div class="search-result" data-open-product="${p.id}"><img src="${p.image}" alt="${p.name}"/><p>${p.name} · ${money(p.price)}</p></div>`).join('') || '<p>No products found.</p>';
}
function observeReveals(){
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll('.reveal:not(.visible)').forEach(el=>io.observe(el));
}

document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]'); if(add){e.stopPropagation();addToCart(add.dataset.add);return;}
  const open=e.target.closest('[data-open-product]'); if(open){openProduct(open.dataset.openProduct);return;}
  if(e.target.closest('[data-open-cart]')) setDrawer(true);
  if(e.target.closest('[data-close-cart]') || e.target===scrim) setDrawer(false);
  const qty=e.target.closest('[data-qty]'); if(qty){const id=qty.dataset.id; const next=(cart.get(id)||0)+(qty.dataset.qty==='plus'?1:-1); next<=0?cart.delete(id):cart.set(id,next); updateCart();}
});
productGrid.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ') && e.target.dataset.openProduct) openProduct(e.target.dataset.openProduct); });
document.querySelector('#modalClose').addEventListener('click',()=>document.querySelector('#productModal').close());
document.querySelector('#modalAdd').addEventListener('click',()=>{addToCart(activeProduct.id);document.querySelector('#productModal').close();setDrawer(true);});
document.querySelector('#searchButton').addEventListener('click',()=>setSearch(true));
document.querySelector('#mobileSearchButton').addEventListener('click',()=>{setMobileMenu(false);setSearch(true)});
document.querySelector('#searchClose').addEventListener('click',()=>setSearch(false));
document.querySelector('#searchInput').addEventListener('input',e=>renderSearch(e.target.value));
document.querySelector('#viewAllProducts').addEventListener('click',()=>{renderProducts(products);showToast('All CURA essentials are now visible');});
document.querySelector('#checkoutButton').addEventListener('click',()=>showToast('Checkout is ready for payment integration'));
document.querySelector('#newsletterForm').addEventListener('submit',e=>{e.preventDefault();document.querySelector('#newsletterMessage').textContent='Thank you. A note from CURA will arrive shortly.';e.target.reset();});
const mobileMenu=document.querySelector('#mobileMenu');
function setMobileMenu(open){mobileMenu.classList.toggle('open',open);mobileMenu.setAttribute('aria-hidden',String(!open));document.querySelector('#mobileMenuButton').setAttribute('aria-expanded',String(open));document.body.classList.toggle('no-scroll',open);}
document.querySelector('#mobileMenuButton').addEventListener('click',()=>setMobileMenu(true));
document.querySelector('#mobileMenuClose').addEventListener('click',()=>setMobileMenu(false));
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMobileMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){setDrawer(false);setSearch(false);setMobileMenu(false);const modal=document.querySelector('#productModal');if(modal.open)modal.close();}});

renderProducts(); updateCart(); observeReveals();
