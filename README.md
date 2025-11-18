# NameMemory 🧠

**Remember Names, Build Connections**

A mobile-first web application designed to help you memorize names and faces at events, meetings, and networking gatherings.

## Features

### 🎯 Core Functionality

- **Group Management**: Create groups for different events (e.g., "Team Meeting 2024", "Conference Attendees")
- **Person Profiles**: Store detailed information for each person
  - Required: First name
  - Optional: Middle name, last name, suffix, nickname, description, notes
  - Photo upload with automatic optimization
- **Learning Mode**: Practice memorizing names with concealed names and photo flashcards
  - Randomized order ensuring equal exposure
  - Tap to reveal name
  - Progress tracking
- **Quick Reference**: Fast lookup mode for when you need a name quickly
  - Scrollable list with thumbnails
  - Search/filter functionality
  - Perfect for use at events

### 🔐 User Features

- **Multi-Device Sync**: Access your groups on any device
- **Group Sharing**: Share groups with other users
  - View-only or edit permissions
  - Email notifications
  - Perfect for team collaboration
- **Secure Authentication**: JWT-based authentication
- **Password Reset**: Email-based password recovery

### 📱 Mobile-Optimized

- Responsive design for all screen sizes
- Touch-friendly interface
- Fast loading optimized images (WebP format)
- Works great on phones, tablets, and desktops

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **React Router** for navigation

### Backend
- **PHP 7.4+** REST API
- **MySQL** database
- **JWT** authentication
- **Image optimization** (GD/ImageMagick)
- **Email notifications** (SMTP)

## Project Structure

```
NameMemory/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Dependencies
│
├── backend/                 # PHP backend API
│   ├── api/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/        # Data models
│   │   ├── utils/         # Helper utilities
│   │   └── index.php      # API router
│   └── uploads/           # User-uploaded images
│
├── database/              # Database schema
│   └── schema.sql        # MySQL schema
│
├── DEPLOYMENT.md         # Deployment guide
└── README.md            # This file
```

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- PHP 7.4+ with MySQL
- MySQL database
- Web server (Apache/Nginx) or PHP built-in server

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

The frontend will run on `http://localhost:5173`

### Backend Setup

1. Create MySQL database:
```sql
CREATE DATABASE namememory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import schema:
```bash
mysql -u root -p namememory < database/schema.sql
```

3. Configure backend:
```bash
cd backend/api/config
cp database.example.php database.php
# Edit database.php with your credentials
```

4. Set upload permissions:
```bash
chmod 755 backend/uploads/photos
chmod 755 backend/uploads/thumbnails
```

5. Start PHP server:
```bash
cd backend/api
php -S localhost:8000
```

The API will run on `http://localhost:8000`

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed SiteGround deployment instructions.

Quick overview:
1. Build frontend: `npm run build`
2. Upload files to SiteGround
3. Configure database
4. Set permissions
5. Test and launch!

## Usage Guide

### Creating Your First Group

1. **Register/Login** at the app homepage
2. **Click "Create Group"** on the dashboard
3. **Name your group** (e.g., "Office Team 2024")
4. **Add people** by clicking "+ Add Person"
5. **Fill in details** - only first name is required
6. **Upload a photo** for better memorization

### Learning Mode

1. Open a group
2. Click "Practice Names"
3. Study the photo and try to recall the name
4. Click "Reveal Name" to check
5. Use "Next" to continue
6. At the end, the list reshuffles automatically

### Quick Reference

1. Open a group
2. Click "Quick Reference"
3. Scroll through the list or use search
4. Perfect for quick lookups at events!

### Sharing Groups

1. Open a group you own
2. Click "Share"
3. Enter collaborator's email
4. Choose permission level (View or Edit)
5. They'll receive an email notification
6. Changes sync automatically!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Groups
- `GET /api/groups` - List all groups (owned + shared)
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### People
- `GET /api/groups/:id/people` - List people in group
- `POST /api/groups/:id/people` - Add person to group
- `GET /api/people/:id` - Get person details
- `POST /api/people/:id` - Update person (multipart for photos)
- `DELETE /api/people/:id` - Delete person

### Sharing
- `GET /api/groups/:id/shares` - List group shares
- `POST /api/groups/:id/share` - Share group with user
- `DELETE /api/groups/:id/share/:userId` - Remove share

## Image Optimization

Photos are automatically optimized:
- Resized to max 800px width (maintains aspect ratio)
- Compressed to 75% quality
- Converted to WebP format
- Thumbnails generated at 150px
- Result: ~100-200KB per full image, ~10-20KB per thumbnail

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- SQL injection prevention (prepared statements)
- CORS headers
- Input validation
- Secure file uploads

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This is a personal project, but suggestions are welcome!

## License

MIT License - feel free to use and modify for your needs.

## Author

Created to solve the common problem of remembering names at events and building better professional relationships.

## Roadmap

Potential future enhancements:
- [ ] PWA support for offline access
- [ ] Spaced repetition algorithm for learning
- [ ] Import from CSV/contacts
- [ ] Custom fields for people
- [ ] Tags and categories
- [ ] Export to PDF/printable
- [ ] Mobile apps (React Native)
- [ ] Audio pronunciation clips

## Support

For issues or questions:
1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
2. Review the troubleshooting section
3. Check console logs for errors
4. Verify database and API configuration

---

**Happy Networking! Remember more names, build better connections!** 🎉
