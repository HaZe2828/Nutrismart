document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. MEMUAT HEADER & SETTING STICKY NAV ---
    loadHeaderAndSetupSticky();

    // --- 2. MEMUAT FOOTER ---
    loadFooter();

    // --- 3. MENJALANKAN LOGIKA KALKULATOR BMI ---
    setupBmiCalculator();

    // --- 4. MENJALANKAN LOGIKA KALKULATOR BMR ---
    setupBmrCalculator(); 

    // --- 5. MENJALANKAN ANIMASI FADE-IN ---
    setupFadeInObserver();

});

// ==================================================================================
// BAGIAN 1: FUNGSI UTILITY SITUS (HEADER, FOOTER, FADE-IN)
// ==================================================================================

function loadHeaderAndSetupSticky() {
    fetch('header.html')
        .then(response => response.ok ? response.text() : Promise.reject('Gagal memuat header'))
        .then(data => {
            const placeholder = document.getElementById('header-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
                const header = document.getElementById('main-header');
                if (header) { 
                    const stickyOffset = header.offsetTop + 50; 
                    window.onscroll = function() {
                        if (window.pageYOffset > stickyOffset) {
                            header.classList.add('sticky');
                        } else {
                            header.classList.remove('sticky');
                        }
                    };
                }
            }
        })
        .catch(error => console.error('Error loading header:', error));
}

function loadFooter() {
    fetch('footer.html')
        .then(response => response.ok ? response.text() : Promise.reject('Gagal memuat footer'))
        .then(data => {
            const placeholder = document.getElementById('footer-placeholder');
            if (placeholder) placeholder.innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
}

function setupFadeInObserver() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    if (fadeElements.length > 0) {
        const observerOptions = {
            root: null,
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeElements.forEach(el => {
            observer.observe(el);
        });
    }
}

// ==================================================================================
// BAGIAN 2: LOGIKA KALKULATOR (BMI & BMR)
// ==================================================================================

function setupBmiCalculator() {
    const bmiForm = document.getElementById("bmi-form");
    if (bmiForm) { 
        const beratInput = document.getElementById("berat");
        const tinggiInput = document.getElementById("tinggi");
        const hasilContainer = document.getElementById("hasil-bmi");
        const errorContainer = document.getElementById("error-message");
        const nilaiBmiElem = document.getElementById("nilai-bmi");
        const kategoriBmiElem = document.getElementById("kategori-bmi");
        const saranBmiElem = document.getElementById("saran-bmi");
        const nilaiIdealElem = document.getElementById("nilai-ideal");

        bmiForm.addEventListener("submit", function(event) {
            event.preventDefault(); 
            const berat = parseFloat(beratInput.value);
            const tinggi = parseFloat(tinggiInput.value);
            const genderRadio = document.querySelector('input[name="gender"]:checked');
            
            if (!genderRadio) {
                tampilkanError("Harap pilih jenis kelamin Anda.");
                return;
            }
            const gender = genderRadio.value;

            if (isNaN(berat) || isNaN(tinggi) || berat <= 0 || tinggi <= 0) {
                tampilkanError("Harap masukkan nilai berat dan tinggi badan yang valid.");
                return;
            }
            errorContainer.style.display = "none";

            const tinggiMeter = tinggi / 100;
            const bmi = berat / (tinggiMeter * tinggiMeter);
            const bmiRounded = bmi.toFixed(1);

            let kategori = "", saran = "", statusClass = "";

            if (bmi < 18.5) {
                kategori = "Kekurangan Berat Badan";
                saran = "Anda kekurangan berat badan. Konsultasikan dengan ahli gizi.";
                statusClass = "status-kurus";
            } else if (bmi >= 18.5 && bmi <= 24.9) {
                kategori = "Berat Badan Normal";
                saran = "Anda memiliki berat badan yang sehat. Pertahankan!";
                statusClass = "status-normal";
            } else if (bmi >= 25 && bmi <= 29.9) {
                kategori = "Kelebihan Berat Badan";
                saran = "Anda memiliki kelebihan berat badan. Pertimbangkan pola makan sehat.";
                statusClass = "status-gemuk";
            } else {
                kategori = "Obesitas";
                saran = "Anda berada dalam kategori obesitas. Segera konsultasikan dengan dokter.";
                statusClass = "status-obesitas";
            }

            let beratIdeal = 0;
            const tinggiDasar = tinggi - 100;
            if (gender === "pria") {
                beratIdeal = tinggiDasar - (0.10 * tinggiDasar);
            } else if (gender === "wanita") {
                beratIdeal = tinggiDasar - (0.15 * (tinggiDasar));
            }
            const beratIdealRounded = beratIdeal.toFixed(1);

            nilaiBmiElem.innerText = bmiRounded;
            kategoriBmiElem.innerText = kategori;
            saranBmiElem.innerText = saran;
            hasilContainer.className = "hasil-container " + statusClass;
            nilaiIdealElem.innerText = `${beratIdealRounded} kg`;
            hasilContainer.style.display = "flex";
        });

        function tampilkanError(pesan) {
            errorContainer.innerHTML = `<p>${pesan}</p>`;
            errorContainer.style.display = "block";
            hasilContainer.style.display = "none";
        }

        function sembunyikanError() {
            errorContainer.style.display = "none";
        }

        beratInput.addEventListener('input', sembunyikanError);
        tinggiInput.addEventListener('input', sembunyikanError);
        document.querySelectorAll('input[name="gender"]').forEach(radio => {
            radio.addEventListener('change', sembunyikanError);
        });
    } 
}

// FUNGSI PEMBANTU BMR
function getActivityData(activityLevel) {
    let factor;
    let label;
    switch (activityLevel) {
        case 'sedentary': factor = 1.2; label = 'Jarang/Tidak Pernah (Bedrest/Pemulihan)'; break;
        case 'lightly-active': factor = 1.375; label = 'Ringan (Pelajar/Kebanyakan Duduk/WFH)'; break;
        case 'moderately-active': factor = 1.55; label = 'Sedang (Ibu Rumah Tangga/Pekerjaan Meja Aktif)'; break;
        case 'very-active': factor = 1.725; label = 'Berat (Kuli Bangunan/Pekerja Pabrik)'; break;
        case 'extra-active': factor = 1.9; label = 'Sangat Berat (Atlet Profesional/Latihan 2x sehari)'; break;
        default: factor = 1.2; label = 'Tidak Diketahui (Asumsi Sedang)';
    }
    return { factor, label };
}

function getStressFactor(stressLevel) {
    let factor;
    switch (stressLevel) {
        case 'none': factor = 1.0; break;
        case 'infection_light': case 'cancer': factor = 1.1; break;
        case 'infection_medium': factor = 1.25; break;
        case 'infection_heavy': factor = 1.4; break;
        case 'peritonitis': factor = 1.5; break;
        case 'surgery_minor': case 'trauma_skeletal': factor = 1.15; break;
        case 'surgery_major': case 'trauma_longbone': case 'trauma_multiple': factor = 1.3; break;
        case 'burn_light': factor = 1.5; break;
        case 'burn_medium': factor = 1.8; break;
        case 'burn_heavy': factor = 2.0; break;
        default: factor = 1.0;
    }
    return factor;
}

function setupBmrCalculator() {
    const bmrForm = document.getElementById('bmr-form');
    const bmrErrorContainer = document.getElementById('bmr-error-message');

    function tampilkanBmrError(pesan) {
        if (bmrErrorContainer) {
            bmrErrorContainer.innerHTML = `<p>${pesan}</p>`;
            bmrErrorContainer.style.display = 'block';
        }
        document.getElementById('hasil-bmr').style.display = 'none';
    }
    function sembunyikanBmrError() {
        if (bmrErrorContainer) bmrErrorContainer.style.display = 'none';
    }

    if (bmrForm) {
        ['weight', 'height', 'age', 'gender', 'activity', 'stress'].forEach(id => {
            const inputElement = document.getElementById(id);
            if (inputElement) {
                inputElement.addEventListener('input', sembunyikanBmrError);
                inputElement.addEventListener('change', sembunyikanBmrError);
            }
        });

        bmrForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const gender = document.getElementById('gender').value;
            const weight = parseFloat(document.getElementById('weight').value);
            const height = parseFloat(document.getElementById('height').value);
            const age = parseInt(document.getElementById('age').value);
            const activityLevel = document.getElementById('activity').value;
            const stressLevel = document.getElementById('stress').value;

            if (isNaN(weight) || isNaN(height) || isNaN(age) || weight <= 0 || height <= 0 || age <= 0) {
                tampilkanBmrError("Harap masukkan data yang valid.");
                return;
            }
            sembunyikanBmrError();

            let bmr;
            if (gender === 'male') {
                bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
            } else { 
                bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
            }
            const roundedBMR = Math.round(bmr);

            const { factor: activityFactor, label: activityLabelText } = getActivityData(activityLevel);
            const stressFactor = getStressFactor(stressLevel);
            const totalFactor = activityFactor * stressFactor;

            const tee = bmr * totalFactor;
            const roundedTEE = Math.round(tee);

            document.getElementById('bmr-value').textContent = roundedBMR.toLocaleString('id-ID'); 
            document.getElementById('tdee-value').textContent = roundedTEE.toLocaleString('id-ID');
            
            let finalLabel = activityLabelText;
            if (stressFactor > 1.0) finalLabel += ` (Faktor Stres: x${stressFactor.toFixed(2)})`;
            
            document.getElementById('activity-label').textContent = finalLabel;
            document.getElementById('hasil-bmr').style.display = 'flex';
        });
    }
}

// ==================================================================================
// BAGIAN 3: LOGIKA KATALOG PRODUK (SLIDER & LINK WA/SHOPEE) - UPDATE
// ==================================================================================

// 1. Data Produk (Update: 'images' array & 'shopeeLink')
const productsDB = [
    {
        id: 1,
        category: "Meal Plan",
        title: "Paket Diet 30 Hari",
        price: "Rp 1.500.000",
        desc: "Menu katering sehat lengkap (Makan Siang & Malam) rendah kalori. Disusun oleh ahli gizi.",
        // Gunakan Array images untuk banyak gambar
        images: [
            "/public/diet_1.jpg",
            "/public/diet_2.jpg",
            "/public/diet_3.jpg"
        ],
        variants: [
            { name: "Tujuan", options: ["Mie Nami", "Morina Sorgum Cookies", "Mori Boost", "Bloomy Bite", "Morikado", "Healthy Ice Cream", "Cookies Daun Katuk"] }
        ],
        shopeeLink: "https://shopee.co.id/SHARP-2T-C24HD1500i-LED-TV-24INCH-Digital-i.880370364.42106683783?extraParams=%7B%22display_model_id%22%3A270563913112%2C%22model_selection_logic%22%3A3%7D"
    },
    {
        id: 2,
        category: "Suplemen",
        title: "NutriWhey Isolate",
        price: "Rp 450.000",
        desc: "Protein murni (25g per sajian) untuk pembentukan otot. Bebas gula dan rendah lemak.",
        images: [
            "https://placehold.co/600x600?text=Whey+Depan",
            "https://placehold.co/600x600?text=Whey+Nutrisi",
            "https://placehold.co/600x600?text=Whey+Bubuk"
        ],
        variants: [
            { name: "Rasa", options: ["Cokelat", "Vanilla", "Strawberry"] },
            { name: "Ukuran", options: ["450g", "900g"] }
        ],
        shopeeLink: "https://shopee.co.id/nutriwhey-dummy"
    },
    {
        id: 3,
        category: "Alat Kesehatan",
        title: "Smart Body Scale",
        price: "Rp 299.000",
        desc: "Timbangan digital pintar yang dapat mengukur BMI, kadar lemak, dan massa otot.",
        images: [
            "https://placehold.co/600x600?text=Scale+White",
            "https://placehold.co/600x600?text=Scale+App",
            "https://placehold.co/600x600?text=Scale+Black"
        ],
        variants: [
            { name: "Warna", options: ["Putih", "Hitam"] }
        ],
        shopeeLink: "https://shopee.co.id/smart-scale-dummy"
    },
    {
        id: 4,
        category: "Layanan",
        title: "Sesi Ahli Gizi",
        price: "Rp 150.000",
        desc: "Konsultasi privat via video call dengan Dr. Budi Santoso.",
        images: [
            "https://placehold.co/600x600?text=Konsultasi+1",
            "https://placehold.co/600x600?text=Konsultasi+2"
        ],
        variants: [
            { name: "Jadwal", options: ["Pagi", "Siang", "Sore"] }
        ],
        shopeeLink: "https://shopee.co.id/konsultasi-gizi-dummy"
    }
];

// --- VARIABEL GLOBAL UNTUK SLIDER ---
let currentProductId = null;
let currentImageIndex = 0;
let currentProductData = null; // Menyimpan data produk yang sedang dibuka

// 2. Fungsi Membuka Modal (Dibuat Global agar bisa dipanggil onclick HTML)
window.openModal = function(productId) {
    const product = productsDB.find(p => p.id === productId);
    if (!product) return;

    // Simpan data ke variabel global
    currentProductData = product;
    currentProductId = productId;
    currentImageIndex = 0; // Reset ke gambar pertama

    // Isi konten teks dasar
    const catEl = document.getElementById('m-category');
    const titleEl = document.getElementById('m-title');
    const priceEl = document.getElementById('m-price');
    const descEl = document.getElementById('m-desc');

    if (catEl) catEl.textContent = product.category;
    if (titleEl) titleEl.textContent = product.title;
    if (priceEl) priceEl.textContent = product.price;
    if (descEl) descEl.textContent = product.desc;

    // Update Link Shopee
    const btnShopee = document.getElementById('btn-shopee');
    if (btnShopee) {
        btnShopee.href = product.shopeeLink || "#";
    }

    // Render Gambar Pertama
    updateSliderImage();

    // Render Varian secara Dinamis
    const variantContainer = document.getElementById('m-variants-container');
    if (variantContainer) {
        variantContainer.innerHTML = ''; 

        if (product.variants && product.variants.length > 0) {
            product.variants.forEach((variant, index) => {
                const group = document.createElement('div');
                group.className = 'variant-group';
                
                const label = document.createElement('label');
                label.className = 'variant-label';
                label.textContent = `Pilih ${variant.name}:`;
                
                const select = document.createElement('select');
                select.className = 'variant-select';
                // Tambahkan ID unik agar bisa diambil valuenya nanti untuk WA
                select.id = `variant-${index}`;
                
                variant.options.forEach(option => {
                    const optElement = document.createElement('option');
                    optElement.value = option;
                    optElement.textContent = option;
                    select.appendChild(optElement);
                });

                group.appendChild(label);
                group.appendChild(select);
                variantContainer.appendChild(group);
            });
        }
    }

    // Tampilkan Modal
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Matikan scroll background
    }
};

// 3. Logika Slider Gambar
window.updateSliderImage = function() {
    if (!currentProductData) return;
    
    const imgElement = document.getElementById('m-image');
    const counterElement = document.getElementById('m-slide-counter');
    
    // Set source gambar berdasarkan index saat ini
    if (imgElement) {
        imgElement.src = currentProductData.images[currentImageIndex];
    }
    
    // Update text counter (misal: 1/3)
    if (counterElement) {
        const totalImages = currentProductData.images.length;
        counterElement.textContent = `${currentImageIndex + 1} / ${totalImages}`;
    }
};

window.nextImage = function() {
    if (!currentProductData) return;
    currentImageIndex++;
    // Jika sudah di akhir, balik ke awal
    if (currentImageIndex >= currentProductData.images.length) {
        currentImageIndex = 0;
    }
    updateSliderImage();
};

window.prevImage = function() {
    if (!currentProductData) return;
    currentImageIndex--;
    // Jika di awal, balik ke akhir
    if (currentImageIndex < 0) {
        currentImageIndex = currentProductData.images.length - 1;
    }
    updateSliderImage();
};

// 4. Logika Beli via WhatsApp (Dinamis dengan Varian)
window.buyViaWhatsapp = function() {
    if (!currentProductData) return;

    // Nomor WA Admin (Ganti dengan nomor asli Anda, format 62...)
    const phoneNumber = "6281234567890"; 
    
    // Ambil nama produk
    let message = `Halo Admin, saya ingin membeli: \n*${currentProductData.title}*\n`;
    
    // Ambil nilai varian yang dipilih user
    if (currentProductData.variants) {
        message += `\nDetail Pesanan:`;
        currentProductData.variants.forEach((variant, index) => {
            const selectElement = document.getElementById(`variant-${index}`);
            const selectedValue = selectElement ? selectElement.value : "-";
            message += `\n- ${variant.name}: ${selectedValue}`;
        });
    }

    message += `\n\nMohon info total harganya. Terima kasih!`;

    // Encode URL agar bisa dikirim via link
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${6289605771798}?text=${encodedMessage}`;

    // Buka di tab baru
    window.open(whatsappUrl, '_blank');
};

// 5. Fungsi Menutup Modal
window.closeModal = function() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Hidupkan scroll background
    }
};

window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target == modal) {
        window.closeModal();
    }
};
document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. MEMUAT HEADER & SETTING STICKY NAV ---
    loadHeaderAndSetupSticky();

    // --- 2. MEMUAT FOOTER ---
    loadFooter();

    // --- 3. MENJALANKAN LOGIKA KALKULATOR BMI ---
    setupBmiCalculator();

    // --- 4. MENJALANKAN LOGIKA KALKULATOR BMR ---
    setupBmrCalculator(); 

    // --- 5. MENJALANKAN LOGIKA KONSULTASI & MEAL PLAN ---
    setupConsultationLogic();

    // --- 6. MENJALANKAN ANIMASI FADE-IN ---
    setupFadeInObserver();

});

// ==================================================================================
// BAGIAN 4: LOGIKA KONSULTASI GIZI & MEAL PLAN (DARI GAMBAR)
// ==================================================================================

function setupConsultationLogic() {
    const orderForm = document.getElementById('orderForm');
    const payButton = document.getElementById('payButton');
    const displayTotal = document.getElementById('displayTotal');

    if (orderForm) {
        orderForm.addEventListener('change', () => {
            // Mencari radio button yang dipilih
            const selected = document.querySelector('input[name="program"]:checked');
            
            if (selected) {
                // Update tampilan total harga dengan format Rupiah
                const price = parseInt(selected.value);
                displayTotal.innerText = "Rp " + price.toLocaleString('id-ID');
                
                // Aktifkan tombol bayar
                if (payButton) {
                    payButton.disabled = false;
                    payButton.classList.add('active'); // Jika Anda ingin memberi style khusus saat aktif
                }
            }
        });
    }

    // Fungsi Pembayaran/Konfirmasi (Global agar bisa dipanggil via onclick jika perlu)
    window.redirectToPayment = function() {
        const selected = document.querySelector('input[name="program"]:checked');
        
        if (!selected) {
            alert("Silakan pilih program terlebih dahulu.");
            return;
        }

        const programName = selected.getAttribute('data-name');
        const price = parseInt(selected.value).toLocaleString('id-ID');
        const adminWA = "6289605771798"; // Sesuai nomor di kode Anda sebelumnya

        // Format pesan untuk WhatsApp
        const message = `Halo Admin, saya ingin mendaftar program berikut:\n\n` +
                        `*Program:* ${programName}\n` +
                        `*Harga:* Rp ${price}\n\n` +
                        `Mohon instruksi selanjutnya untuk pembayaran.`;

        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/${adminWA}?text=${encodedMessage}`;

        // Efek transisi atau notifikasi sebelum diarahkan
        console.log("Mengarahkan ke pembayaran untuk: " + programName);
        window.open(waUrl, '_blank');
    };
}

// ... KODE ANDA BERIKUTNYA (BAGIAN 1, 2, 3) ...