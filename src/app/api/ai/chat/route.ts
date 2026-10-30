import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

// Read Gemini API Key from process.env or directly from .env.local to avoid needing server restarts
function getGeminiApiKey(): string | undefined {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    return process.env.GEMINI_API_KEY.trim()
  }
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      const match = content.match(/GEMINI_API_KEY\s*=\s*(.+)/)
      if (match && match[1]) {
        return match[1].trim().replace(/^['"]|['"]$/g, '')
      }
    }
  } catch (e) {
    console.error('Failed to read .env.local directly:', e)
  }
  return undefined
}

// Sanitize response to remove any leaked internal chain-of-thought or draft notes
function sanitizeAiResponse(text: string): string {
  let cleaned = text.trim()

  // If Gemini leaked draft thoughts like "User's question:" or "* Current Date:"
  if (
    cleaned.includes("User's question:") ||
    cleaned.includes('Current Date (Implicit/System):') ||
    cleaned.includes('*   Self-correction:')
  ) {
    // Check if the final actual response is enclosed in quotes at the end
    const lastQuoteMatch = cleaned.match(/"([^"]{15,})"\s*$/)
    if (lastQuoteMatch && lastQuoteMatch[1]) {
      return lastQuoteMatch[1].trim()
    }

    // Or split by double line breaks and keep only the non-scratchpad paragraphs
    const paragraphs = cleaned.split(/\n\s*\n/)
    const validParagraphs = paragraphs.filter(
      (p) =>
        !p.includes("User's question:") &&
        !p.includes('Current Date') &&
        !p.includes('Self-correction:') &&
        !p.includes('Option 1') &&
        !p.includes('Option 2') &&
        !p.includes('Persona:') &&
        !p.includes('Tone:'),
    )

    if (validParagraphs.length > 0) {
      cleaned = validParagraphs
        .join('\n\n')
        .replace(/^["']|["']$/g, '')
        .trim()
    }
  }

  return cleaned
}

// Smart Local AI Simulator: Rich contextual generator when GEMINI_API_KEY is not configured
function generateSmartSimulation(message: string): string {
  const m = message.toLowerCase().trim()

  // 1. Gợi ý caption Instagram / Thơ / Status
  if (
    m.includes('caption') ||
    m.includes('stt') ||
    m.includes('status') ||
    m.includes('đăng ảnh') ||
    m.includes('viết giúp') ||
    m.includes('bài viết')
  ) {
    if (m.includes('du lịch') || m.includes('travel') || m.includes('biển') || m.includes('núi')) {
      return (
        'Gợi ý 3 caption du lịch cực chất cho bạn nè ✈️🌊:\n\n' +
        '1. 🌿 "Tuổi trẻ này ngắn lắm, đừng để đôi chân ngừng bước và đôi mắt ngừng mơ."\n' +
        '2. 🏖️ "Trốn khỏi deadline, tìm về nơi có nắng vàng và biển xanh."\n' +
        '3. 🌅 "Chuyến đi tuyệt nhất không phải là đến đâu, mà là cảm giác tự do trong từng khoảnh khắc."\n\n' +
        'Bạn thích vibe nào nhất, mình điều chỉnh lại cho đúng gu nhé! ✨'
      )
    }
    if (
      m.includes('thính') ||
      m.includes('crush') ||
      m.includes('yêu') ||
      m.includes('người yêu')
    ) {
      return (
        'Cap thả thính 100% dính crush đây nha 😉:\n\n' +
        '1. 💕 "Trời đổ mưa rồi, sao cậu chưa đổ mình?"\n' +
        '2. ☕ "Cà phê đắng nhưng có em thì ngọt ngào."\n' +
        '3. 📸 "Ảnh này không có filter, nhưng lại filter hết ánh nhìn của anh về phía em."\n\n' +
        'Đăng kèm bức ảnh selfie tươi tắn là crush tim liền! ❤️'
      )
    }
    if (m.includes('đồ ăn') || m.includes('food') || m.includes('bánh') || m.includes('cà phê')) {
      return (
        'Caption dành cho tín đồ ẩm thực & cafe chill 🥐☕:\n\n' +
        '1. 🍰 "Hạnh phúc đôi khi chỉ đơn giản là một tách latte ấm và một chiếc bánh thơm."\n' +
        '2. 😋 "Ăn uống là niềm vui, giảm cân là chuyện của ngày mai."\n' +
        '3. ✨ "Tự thưởng cho bản thân chút ngọt ngào sau những ngày làm việc chăm chỉ."\n\n' +
        'Chúc bạn có một bài đăng triệu tim nha! 🌟'
      )
    }

    return (
      'Dưới đây là vài caption Instagram đa phong cách cho bạn lựa chọn nè ✨:\n\n' +
      '✨ Phong cách Chill / Tối giản: "Giữ tâm thanh thản giữa những ngày bộn bề."\n' +
      '😎 Phong cách Cool ngầu: "Không hoàn hảo, nhưng là duy nhất."\n' +
      '🌸 Phong cách Tươi vui: "Mỗi ngày mới là một lý do để cười thật rạng rỡ."\n\n' +
      'Bạn muốn viết riêng cho bức ảnh nào, miêu tả sơ giúp mình nhé! 📸'
    )
  }

  // 2. Chụp ảnh / Góc chụp / Pose dáng
  if (
    m.includes('chụp ảnh') ||
    m.includes('pose') ||
    m.includes('tạo dáng') ||
    m.includes('góc chụp') ||
    m.includes('camera') ||
    m.includes('filter')
  ) {
    return (
      'Mẹo chụp ảnh Instagram chuẩn feed xịn xò từ Meta AI 📸✨:\n\n' +
      '1. ☀️ Ánh sáng tự nhiên (Golden Hour): Khoảng 7-8h sáng hoặc 16h30-17h30 chiều là lúc ánh sáng mềm mịn nhất, da dẻ auto phát sáng!\n' +
      '2. 📐 Quy tắc 1/3: Bật lưới máy ảnh lên, đặt mắt hoặc chủ thể vào điểm giao giữa các đường lưới.\n' +
      '3. 🚶 Dáng chuyển động tự nhiên: Hãy giả vờ bước đi, vuốt tóc nhẹ hoặc nhìn xa xăm thay vì đứng nghiêm trang.\n' +
      '4. 📱 Hạ thấp góc máy (Low angle): Đặt máy ngang thắt lưng và nghiêng nhẹ lên sẽ giúp kéo dài chân đáng kể đấy! 💃'
    )
  }

  // 3. Ý tưởng quay Reels / TikTok
  if (
    m.includes('reels') ||
    m.includes('reel') ||
    m.includes('video') ||
    m.includes('quay') ||
    m.includes('trend')
  ) {
    return (
      'Gợi ý ý tưởng video Reels ngắn 15s - 30s dễ viral nè 🎬🔥:\n\n' +
      '• Concept "A Day in My Life": 5-7 clip ngắn ghép lại (pha cà phê -> làm việc/học -> ăn trưa -> hoàng hôn chiều) với nhạc lofi chill.\n' +
      '• Transition "Trước & Sau" (Before / After): Gõ tay vào màn hình hoặc búng tay để chuyển cảnh từ đồ ở nhà sang outfit lộng lẫy.\n' +
      '• "3 điều mình ước mình biết sớm hơn": Chia sẻ mẹo hữu ích trong lĩnh vực của bạn (coding, làm bánh, chụp ảnh, chăm da).\n\n' +
      'Cần gợi ý bài nhạc trending phù hợp không nè? 🎵'
    )
  }

  // 4. Bánh mì / Ẩm thực / Elena Rostova
  if (
    m.includes('bánh') ||
    m.includes('sourdough') ||
    m.includes('elena') ||
    m.includes('baker') ||
    m.includes('nướng') ||
    m.includes('bột')
  ) {
    return (
      'Nhắc đến bánh là nghĩ ngay đến chị @chef_artisan (Elena Rostova) rồi! 🥖🧑‍🍳\n\n' +
      'Mẹo làm bánh Sourdough vỏ giòn ruột xốp chuẩn chuyên gia:\n' +
      '• Tỉ lệ nước (Hydration): Mới làm thì thử 70-75%, thạo rồi hẵng nâng lên 80% nhé.\n' +
      '• Tạo hơi nước tối đa: Bỏ 2 viên đá vào nồi gang (Dutch oven) trước khi đậy nắp, giúp vỏ phồng xốp và tạo vân nứt cực đẹp.\n' +
      '• Rạch bánh góc nghiêng 45 độ: Để bánh nở "tai" (ear) hoàn hảo khi gặp nhiệt cao! 🥐✨'
    )
  }

  // 5. Sarah Connor / Coding / Frontend / Công nghệ
  if (
    m.includes('sarah') ||
    m.includes('creative_coder') ||
    m.includes('code') ||
    m.includes('react') ||
    m.includes('nextjs') ||
    m.includes('frontend') ||
    m.includes('developer')
  ) {
    return (
      'Bạn cũng yêu thích lập trình và giao diện người dùng ư? 💻🚀\n\n' +
      'Giống như bạn @creative_coder và anh @pthanh2803 đang xây dựng dự án Instagram Clone này vậy! ' +
      'Next.js 15 App Router kết hợp Tailwind CSS và Supabase tạo ra trải nghiệm mượt mà không thua kém gì app gốc của Meta. ' +
      'Nếu bạn có câu hỏi về React Server Components, TypeScript hay animation, cứ hỏi mình nhé! ⚡'
    )
  }

  // 6. Hỏi về bản thân / Meta AI / Phước Thành
  if (
    m.includes('bạn là ai') ||
    m.includes('ai là bạn') ||
    m.includes('meta ai') ||
    m.includes('thành') ||
    m.includes('pthanh2803')
  ) {
    return (
      'Mình là Meta AI ✨ — trợ lý trí tuệ nhân tạo thông minh được tích hợp trực tiếp trên Instagram!\n\n' +
      'Mình luôn sẵn sàng 24/7 để đồng hành cùng bạn trên Instagram Clone: từ gợi ý ý tưởng sáng tạo nội dung, giải đáp kiến thức, viết caption, cho đến lắng nghe và tâm sự. ' +
      'Rất vinh hạnh được đồng hành cùng bạn và anh Phước Thành (@pthanh2803)! 😊'
    )
  }

  // 7. Lời chào hỏi
  if (
    m.includes('chào') ||
    m.includes('hello') ||
    m.includes('hi') ||
    m.includes('hey') ||
    m.includes('xin chào')
  ) {
    return (
      'Chào bạn! Rất vui được gặp bạn trên Instagram 👋✨ Hôm nay bạn cảm thấy thế nào? ' +
      'Bạn đang muốn đăng ảnh mới, tìm caption xịn xò, hay muốn khám phá điều gì thú vị cùng Meta AI nè? 😊'
    )
  }

  // 8. Cảm ơn / Khen ngợi
  if (
    m.includes('cảm ơn') ||
    m.includes('thanks') ||
    m.includes('thank you') ||
    m.includes('giỏi')
  ) {
    return (
      'Không có chi nè! 🥰 Được hỗ trợ bạn là niềm vui của Meta AI. ' +
      'Bất cứ khi nào cần ý tưởng hay muốn hỏi điều gì, cứ nhắn cho mình nhé! Chúc bạn một ngày tràn đầy năng lượng và niềm vui! 🌈✨'
    )
  }

  // 9. Phản hồi thông minh mặc định (General fallback)
  return (
    `Meta AI đã nhận được câu hỏi: "${message}". ✨\n\n` +
    'Đây là một chủ đề rất thú vị! Dù bạn đang lên kế hoạch cho một bài viết mới, tìm kiếm cảm hứng sáng tạo hay muốn tìm hiểu thêm về một điều gì đó, mình luôn sẵn sàng đồng hành cùng bạn. ' +
    'Hãy cho mình biết thêm chi tiết hoặc từ khóa cụ thể bạn muốn tập trung vào nhé! 🚀'
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, history } = body as {
      message?: string
      history?: ChatMessage[]
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = getGeminiApiKey()

    // Chế độ 1: Kết nối với Gemini AI Model thật 100% khi có API Key
    if (apiKey && apiKey.trim() !== '') {
      try {
        const formattedContents = []

        if (history && Array.isArray(history)) {
          const recentHistory = history.slice(-6)
          for (const item of recentHistory) {
            formattedContents.push({
              role: item.role === 'model' ? 'model' : 'user',
              parts: [{ text: item.text }],
            })
          }
        }

        formattedContents.push({
          role: 'user',
          parts: [{ text: message }],
        })

        // Lấy thời gian thực tế chính xác theo giờ Việt Nam
        const now = new Date()
        const todayStr = now.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Ho_Chi_Minh',
        })
        const timeStr = now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Ho_Chi_Minh',
        })

        const systemPrompt =
          `Bạn là Meta AI, trợ lý trí tuệ nhân tạo thông minh được tích hợp trên ứng dụng Instagram.\n` +
          `THÔNG TIN THỜI GIAN THỰC TẾ: Hiện tại là ${timeStr}, ${todayStr} (Giờ Việt Nam).\n` +
          `Bạn trò chuyện tự nhiên, ngắn gọn, thân thiện, hóm hỉnh và sành điệu bằng tiếng Việt.\n` +
          `QUY TẮC BẮT BUỘC:\n` +
          `1. CHỈ xuất câu trả lời trực tiếp gửi cho người dùng như một tin nhắn Instagram Direct thông thường.\n` +
          `2. TUYỆT ĐỐI KHÔNG in các ghi chú nháp, suy nghĩ nội tâm, phân tích đề bài (Chain of Thought/Scratchpad) hay "User's question: ...".\n` +
          `3. Khi người dùng hỏi hôm nay là ngày gì hoặc thời gian, hãy dựa vào thông tin thời gian thực tế ở trên để trả lời chính xác và tự nhiên.`

        // 1. Kiểm tra danh sách mô hình thực tế Google cấp cho Key này
        let discoveredModels: string[] = []
        let listErrorDebug = ''

        try {
          const listRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
            method: 'GET',
            headers: {
              'x-goog-api-key': apiKey,
            },
          })

          if (listRes.ok) {
            const listData = await listRes.json()
            if (Array.isArray(listData?.models)) {
              discoveredModels = listData.models
                .filter((m: { supportedGenerationMethods?: string[] }) =>
                  m.supportedGenerationMethods?.includes('generateContent'),
                )
                .map((m: { name: string }) => m.name.replace(/^models\//, ''))
            }
          } else {
            listErrorDebug = await listRes.text()
            console.warn('ListModels with header failed:', listRes.status, listErrorDebug)
          }
        } catch (e) {
          console.warn('Error listing models:', e)
        }

        // 2. Tạo danh sách ưu tiên thử nghiệm
        const candidateModels = Array.from(
          new Set([
            ...discoveredModels,
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro-latest',
            'gemini-pro',
          ]),
        )

        let lastStatus = 0
        let lastErrorText = ''

        // 3. Thử gọi mô hình với cả header x-goog-api-key chuẩn của Google
        for (const candidate of candidateModels) {
          const endpoints = [
            `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent`,
            `https://generativelanguage.googleapis.com/v1/models/${candidate}:generateContent`,
          ]

          for (const apiUrl of endpoints) {
            try {
              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                  system_instruction: {
                    parts: [{ text: systemPrompt }],
                  },
                  contents: formattedContents,
                  generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 600,
                  },
                }),
              })

              if (response.ok) {
                const geminiData = await response.json()
                const rawParts = geminiData?.candidates?.[0]?.content?.parts as
                  | Array<{ text?: string; thought?: boolean }>
                  | undefined

                // Lọc bỏ phần suy nghĩ nội tâm (thought parts)
                let textResult = ''
                if (Array.isArray(rawParts)) {
                  const contentParts = rawParts.filter((p) => !p.thought && p.text)
                  if (contentParts.length > 0) {
                    textResult = contentParts.map((p) => p.text).join('\n')
                  } else if (rawParts[0]?.text) {
                    textResult = rawParts[0].text
                  }
                }

                if (textResult && textResult.trim().length > 0) {
                  // Khử bất kỳ vết nháp nào còn sót lại
                  const finalReply = sanitizeAiResponse(textResult)

                  return NextResponse.json({
                    reply: finalReply,
                    source: 'gemini-real-ai',
                    modelUsed: candidate,
                  })
                }
              } else {
                lastStatus = response.status
                lastErrorText = await response.text()
              }
            } catch (fetchErr) {
              lastErrorText = String(fetchErr)
            }
          }
        }

        // Nếu tất cả candidate đều lỗi, trả về thông tin chi tiết
        let parsedMessage = lastErrorText
        try {
          const parsed = JSON.parse(lastErrorText)
          if (parsed?.error?.message) {
            parsedMessage = parsed.error.message
          }
        } catch {}

        return NextResponse.json({
          reply:
            `⚠️ Google Gemini API phản hồi (${lastStatus}):\n"${parsedMessage}"\n\n` +
            (discoveredModels.length > 0
              ? `📋 Các mô hình Google cung cấp cho key của bạn: ${discoveredModels.slice(0, 3).join(', ')}`
              : listErrorDebug
                ? `🔍 Chi tiết kiểm tra tài khoản: ${listErrorDebug}`
                : ''),
          source: 'gemini-error',
        })
      } catch (geminiError: unknown) {
        console.warn('Gemini API call failed:', geminiError)
        return NextResponse.json({
          reply: `⚠️ Không thể kết nối tới Google Gemini: ${String(geminiError)}`,
          source: 'gemini-fetch-error',
        })
      }
    }

    // Chế độ 2: Smart Simulator (Chỉ kích hoạt khi CHƯA điền API Key trong .env.local)
    const simulatedReply = generateSmartSimulation(message)
    return NextResponse.json({
      reply: simulatedReply,
      source: 'smart-simulator',
    })
  } catch (err: unknown) {
    console.error('AI chat endpoint error:', err)
    return NextResponse.json(
      {
        reply: 'Meta AI đang bận kết nối một chút, bạn thử lại sau giây lát nhé! ✨',
        error: String(err),
      },
      { status: 500 },
    )
  }
}
