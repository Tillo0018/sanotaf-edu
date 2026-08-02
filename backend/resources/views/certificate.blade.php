<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <title>Sertifikat</title>
    <style>
        @page {
            margin: 0;
            size: A4 landscape;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: 'DejaVu Sans', sans-serif;
            color: #333333;
        }
        .bg-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -10;
        }
        .wrapper {
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            bottom: 30px;
            border: 4px double #d4af37; /* Gold border */
            box-sizing: border-box;
            z-index: 10;
        }
        .main-table {
            width: 100%;
            height: 100%;
            text-align: center;
            border-collapse: collapse;
        }
        .logo-text {
            font-size: 32px;
            font-weight: 900;
            color: #1e3a8a; /* Deep blue */
            letter-spacing: 5px;
            padding-top: 30px;
        }
        .title {
            font-size: 65px;
            font-weight: bold;
            color: #d4af37; /* Gold */
            text-transform: uppercase;
            letter-spacing: 8px;
            margin: 10px 0;
        }
        .subtitle {
            font-size: 20px;
            color: #4b5563;
            font-style: italic;
            margin-bottom: 20px;
        }
        .name {
            font-size: 45px;
            font-weight: bold;
            color: #111827;
            margin: 20px 0;
            border-bottom: 2px solid #d4af37;
            display: inline-block;
            padding-bottom: 5px;
        }
        .text {
            font-size: 19px;
            line-height: 1.5;
            color: #374151;
            width: 80%;
            margin: 0 auto;
        }
        .score-container {
            margin-top: 20px;
            margin-bottom: 20px;
        }
        .score-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.9);
            border: 2px solid #d4af37;
            color: #1e3a8a;
            padding: 10px 30px;
            border-radius: 50px;
            font-size: 22px;
            font-weight: bold;
        }
        .footer-table {
            width: 90%;
            margin: 0 auto;
            margin-bottom: 20px;
        }
        .footer-table td {
            width: 33.3%;
            text-align: center;
            vertical-align: middle;
        }
        .sign-line {
            border-bottom: 1px solid #111827;
            width: 200px;
            margin: 0 auto 5px auto;
        }
        .sign-label {
            font-size: 16px;
            color: #374151;
            font-weight: bold;
        }
        .qr-code {
            width: 90px;
            height: 90px;
            border: 2px solid #d4af37;
            padding: 5px;
            background: #fff;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <!-- Background Image -->
    @if(isset($bgImage) && $bgImage)
        <img src="data:image/jpeg;base64,{{ $bgImage }}" class="bg-image">
    @endif

    <div class="wrapper">
        <table class="main-table">
            <tr>
                <td style="vertical-align: top;">
                    <div class="logo-text">SANOTAF</div>
                    <div class="title">Sertifikat</div>
                    <div class="subtitle">Muvaffaqiyatli ishtirok uchun taqdim etildi</div>
                    
                    <div class="name">{{ $name }}</div>
                    
                    <div class="text">
                        Ushbu sertifikat egasi <b>"Sanogen Tafakkur"</b> mualliflik e-learning o'quv dasturining 
                        barcha modullarini muvaffaqiyatli yakunlaganini va yuqori darajadagi malakaga erishganini tasdiqlaydi.
                    </div>
                    
                    <div class="score-container">
                        <div class="score-badge">
                            Umumiy Natija: {{ $score }} / 100
                        </div>
                    </div>
                </td>
            </tr>
            <tr>
                <td style="vertical-align: bottom;">
                    <table class="footer-table">
                        <tr>
                            <td>
                                <div class="sign-line"></div>
                                <div class="sign-label">Sana: {{ $date }}</div>
                            </td>
                            <td>
                                @if(isset($qrCode) && $qrCode)
                                    <img src="data:image/jpeg;base64,{{ $qrCode }}" class="qr-code">
                                @endif
                            </td>
                            <td>
                                <div class="sign-line"></div>
                                <div class="sign-label">Loyiha rahbariyati</div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
