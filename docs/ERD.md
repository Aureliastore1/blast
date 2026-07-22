# Entity Relationship Diagram — iNaedaa Blast

```mermaid
erDiagram
    USER ||--o{ WHATSAPP_SESSION : owns
    USER ||--o{ CAMPAIGN : creates
    USER ||--o{ CONTACT_LIST : owns
    USER ||--o{ MEDIA_FILE : uploads
    USER ||--o{ TEMPLATE : owns
    USER ||--o{ AUDIT_LOG : generates
    USER ||--|| USER_SETTINGS : has
    USER ||--o{ REFRESH_TOKEN : has

    CONTACT_LIST ||--o{ CONTACT : contains
    CONTACT_LIST ||--o{ CAMPAIGN : "used by"

    WHATSAPP_SESSION ||--o{ CAMPAIGN : "sends via"

    TEMPLATE ||--o{ CAMPAIGN : "used by"
    MEDIA_FILE ||--o{ CAMPAIGN : "attached to"

    CAMPAIGN ||--o{ MESSAGE : contains
    CONTACT ||--o{ MESSAGE : "target of"

    USER {
        uuid id PK
        string name
        string email UK
        string passwordHash
        enum role
        boolean isActive
        datetime lastLoginAt
    }

    WHATSAPP_SESSION {
        uuid id PK
        uuid userId FK
        string sessionName
        enum status
        string phoneNumber
        string profileName
        int batteryLevel
        datetime lastConnectedAt
    }

    CONTACT_LIST {
        uuid id PK
        uuid userId FK
        string name
        string source
        int totalCount
    }

    CONTACT {
        uuid id PK
        uuid contactListId FK
        string phoneNumber
        string name
        boolean isValid
    }

    MEDIA_FILE {
        uuid id PK
        uuid userId FK
        string fileName
        enum type
        int sizeBytes
        string storageDriver
        string path
    }

    TEMPLATE {
        uuid id PK
        uuid userId FK
        string name
        enum category
        text content
        string[] variables
    }

    CAMPAIGN {
        uuid id PK
        uuid userId FK
        uuid whatsappSessionId FK
        uuid contactListId FK
        uuid templateId FK
        uuid mediaFileId FK
        string name
        text messageBody
        enum status
        int minDelaySec
        int maxDelaySec
        int maxPerHour
        int totalContacts
        int sentCount
        int failedCount
    }

    MESSAGE {
        uuid id PK
        uuid campaignId FK
        uuid contactId FK
        string phoneNumber
        text content
        enum status
        int attempts
        string waMessageId
    }

    AUDIT_LOG {
        uuid id PK
        uuid userId FK
        enum action
        string entity
        json metadata
        datetime createdAt
    }

    USER_SETTINGS {
        uuid id PK
        uuid userId FK
        int defaultMinDelaySec
        int defaultMaxDelaySec
        int maxMessagesPerHour
        float autoPauseFailureRate
    }

    REFRESH_TOKEN {
        uuid id PK
        uuid userId FK
        string token UK
        datetime expiresAt
        boolean revoked
    }
```

## Catatan Desain

- **WhatsAppSession** dipisah dari `User` agar satu user dapat memiliki lebih dari satu sesi WA di masa depan (multi-device / multi-nomor), meski MVP membatasi 1 sesi aktif per user.
- **ContactList** dan **Contact** dipisah dari `Campaign` agar daftar kontak dapat dipakai ulang di beberapa campaign.
- **Message** adalah entity granular per-nomor per-campaign — ini yang menjadi basis progress realtime, retry, dan laporan delivery/failure rate.
- **AuditLog** mencatat aksi sensitif (login, start/pause campaign, connect WA, import kontak, export laporan) untuk keperluan keamanan & compliance.
- Semua status memakai enum Postgres native via Prisma agar konsisten dan bisa diindeks.
