# Form Application

Bu proje, Next.js, Node.js ve MongoDB Atlas kullanılarak geliştirilmiş bir form uygulamasıdır.

## Güvenlik Notları

Bu proje hassas bilgiler içermektedir. Lütfen aşağıdaki güvenlik önlemlerini takip edin:

- `.env.local` dosyasını asla GitHub'a pushlamayın
- JWT secret key'inizi güvenli bir şekilde saklayın
- MongoDB Atlas bağlantı bilgilerinizi güvenli tutun
- Production ortamında güvenli bir JWT secret key kullanın

## Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd form-app
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env.local` dosyasını oluşturun:
```bash
cp .env.example .env.local
```

4. `.env.local` dosyasını düzenleyin ve gerekli değişkenleri ayarlayın:
- MONGODB_URI: MongoDB Atlas bağlantı URI'si
- JWT_SECRET: Güvenli bir JWT secret key
- NODE_ENV: development veya production

5. Uygulamayı başlatın:
```bash
npm run dev
```

## Geliştirme

- `npm run dev`: Geliştirme sunucusunu başlatır
- `npm run build`: Production build oluşturur
- `npm start`: Production sunucusunu başlatır

## Lisans

Bu proje özel lisans altında dağıtılmaktadır. Tüm hakları saklıdır. 