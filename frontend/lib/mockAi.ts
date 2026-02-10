/**
 * Mock AI Analysis Service
 * 
 * Bu modül AI analiz servisini simüle eder (akademik MVP için).
 * This module simulates AI analysis service (for academic MVP).
 * 
 * Gerçek üretimde, bu bir API çağrısı olacaktır.
 * In real production, this would be an API call.
 */

export interface AIAnalysisResult {
    is_ai_generated: boolean;
    confidence_score: number; // 0-100
    analysis_time_ms: number;
    metadata?: {
        file_size: number;
        duration?: number;
        format: string;
    };
}

/**
 * Video dosyasını analiz et (mock)
 * Analyze video file (mock)
 * 
 * Bu fonksiyon basit heuristikler kullanarak sahte bir AI analizi yapar.
 * This function performs fake AI analysis using simple heuristics.
 * 
 * @param file - Video dosyası / Video file
 * @returns Promise<AIAnalysisResult> - Analiz sonucu / Analysis result
 */
export async function analyzeVideo(file: File): Promise<AIAnalysisResult> {
    // Gerçekçi bir analiz süresi simüle et (1-3 saniye)
    // Simulate realistic analysis time (1-3 seconds)
    const analysisTime = 1000 + Math.random() * 2000;

    await new Promise(resolve => setTimeout(resolve, analysisTime));

    // Basit heuristikler kullanarak sonuç üret
    // Generate result using simple heuristics

    // Dosya boyutu bazlı skor (küçük dosyalar daha şüpheli)
    // File size based score (smaller files more suspicious)
    const sizeScore = file.size < 1024 * 1024 ? 70 : 40; // < 1MB = suspicious

    // Dosya adı bazlı skor (belirli kelimeler içeriyorsa)
    // Filename based score (if contains certain keywords)
    const nameScore = file.name.toLowerCase().includes('ai') ||
        file.name.toLowerCase().includes('generated') ? 80 : 20;

    // Rastgele faktör (gerçekçilik için)
    // Random factor (for realism)
    const randomScore = Math.random() * 30;

    // Toplam skor hesapla
    // Calculate total score
    const totalScore = (sizeScore * 0.4 + nameScore * 0.4 + randomScore * 0.2);

    // Eşik değeri: 50'nin üzeri AI-generated olarak işaretle
    // Threshold: mark as AI-generated if above 50
    const isAI = totalScore > 50;

    // Güven skorunu normalize et (0-100)
    // Normalize confidence score (0-100)
    const confidence = Math.min(100, Math.max(0, Math.round(totalScore)));

    return {
        is_ai_generated: isAI,
        confidence_score: confidence,
        analysis_time_ms: Math.round(analysisTime),
        metadata: {
            file_size: file.size,
            format: file.type,
        },
    };
}

/**
 * Güven skorunu kategorize et
 * Categorize confidence score
 * 
 * @param score - Güven skoru (0-100) / Confidence score (0-100)
 * @returns Kategori / Category
 */
export function categorizeConfidence(score: number): {
    label: string;
    color: string;
    description: string;
} {
    if (score >= 80) {
        return {
            label: 'Çok Yüksek / Very High',
            color: 'text-green-600',
            description: 'AI analizi sonuca çok güveniyor / AI is very confident in the result',
        };
    } else if (score >= 60) {
        return {
            label: 'Yüksek / High',
            color: 'text-blue-600',
            description: 'AI analizi sonuca güveniyor / AI is confident in the result',
        };
    } else if (score >= 40) {
        return {
            label: 'Orta / Medium',
            color: 'text-yellow-600',
            description: 'AI analizi belirsiz / AI is uncertain',
        };
    } else {
        return {
            label: 'Düşük / Low',
            color: 'text-red-600',
            description: 'AI analizi sonuca güvenmiyor / AI is not confident in the result',
        };
    }
}
