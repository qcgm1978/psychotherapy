import React, { useState } from 'react'
import { ApiKeyManager, hasApiKey, streamDefinition } from 'llm-service-provider'
import './App.css'
import { useI18n } from './lang/i18nContext'

function App() {
  const { t, language, setLanguage } = useI18n()
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [topic, setTopic] = useState('告别拖延症')
  const [isGenerating, setIsGenerating] = useState(false)
  const [contentData, setContentData] = useState<{
    visibleBehaviors: string[]
    psychologicalRoots: string[]
    triggers: string
    emotionStrategies: string
    completionCycle: string
    halfwaySolutions: string[]
  }>({
    visibleBehaviors: [
      '无限期等待完美的「perfect moment」',
      '从核心任务转移到次要任务',
      '频繁中断，转移注意力'
    ],
    psychologicalRoots: [
      '对失败的恐惧',
      '完美主义的陷阱',
      '目标模糊与价值感缺失'
    ],
    triggers: '微小行动点：打开电脑，取出书本，或倒上一杯水，有一个小小的起步。连续动作：起身站立，打开文档，开始阅读，只做一分钟。',
    emotionStrategies: '承认你的感受，使用「5分钟法则」：Just start for 5 minutes, you can stop anytime.',
    completionCycle: '即时奖励与可视化，记录完成的进步，用便签纸作为进度标记贴在墙上。',
    halfwaySolutions: [
      '停下来，重新评估',
      '再次细分任务',
      '寻求情感支持'
    ]
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const [tooltip, setTooltip] = useState<{
    isVisible: boolean
    content: string
    x: number
    y: number
  }>({
    isVisible: false,
    content: '',
    x: 0,
    y: 0
  })

  const handleSaveApiKey = (key: string) => {
    setApiKey(key)
    setIsApiKeyManagerOpen(false)
    setIsMenuOpen(false)
  }

  const generateContent = async () => {
    if (!hasApiKey()) {
      setIsApiKeyManagerOpen(true)
      return
    }

    setIsGenerating(true)
    const controller = new AbortController()
    const signal = controller.signal

    try {
      const prompt = `生成关于"${topic}"的心理治疗内容，包含以下几个部分：
1. 看得见的表面行为（3点）
2. 深层心理根源（3点）
3. 构建开始的触发器策略
4. 情绪接纳机制
5. 建立完成的内在循环
6. 应对半途而废的方案（3点）
请以JSON格式输出，字段名分别为：visibleBehaviors, psychologicalRoots, triggers, emotionStrategies, completionCycle, halfwaySolutions`

      const generator = streamDefinition(prompt, language, undefined, undefined)
      let fullContent = ''
      
      for await (const chunk of generator) {
        if (signal.aborted) break
        fullContent += chunk
      }

      try {
        const parsedContent = JSON.parse(fullContent)
        setContentData(prev => ({
          visibleBehaviors: parsedContent.visibleBehaviors || prev.visibleBehaviors,
          psychologicalRoots: parsedContent.psychologicalRoots || prev.psychologicalRoots,
          triggers: parsedContent.triggers || prev.triggers,
          emotionStrategies: parsedContent.emotionStrategies || prev.emotionStrategies,
          completionCycle: parsedContent.completionCycle || prev.completionCycle,
          halfwaySolutions: parsedContent.halfwaySolutions || prev.halfwaySolutions
        }))
      } catch (jsonError) {
        console.error('解析JSON失败:', jsonError)
      }
    } catch (error) {
      console.error('生成内容时出错:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const showTooltip = (e: React.MouseEvent, content: string) => {
    e.preventDefault()
    setTooltip({
      isVisible: true,
      content,
      x: e.clientX,
      y: e.clientY
    })
  }

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, isVisible: false }))
  }

  return (
    <div className="app">
      <div className="main-container">
        <header className="header">
          <div className="topic-input-section">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={language === 'zh' ? '输入心理治疗主题' : 'Enter therapy topic'}
              className="topic-input"
              title={language === 'zh' ? '点击生成按钮获取个性化心理治疗内容' : 'Click generate button for personalized therapy content'}
              onClick={(e) => showTooltip(e, language === 'zh' ? '输入你想探索的心理主题，例如：焦虑管理、情绪调节、压力缓解等' : 'Enter the psychological topic you want to explore, e.g.: anxiety management, emotional regulation, stress relief, etc.')}
            />
            <button 
              disabled={isGenerating}
              className="generate-button"
              title={language === 'zh' ? '根据输入的主题生成心理治疗内容' : 'Generate therapy content based on the input topic'}
              onClick={(e) => {
                const button = e.currentTarget as HTMLButtonElement
                if (!isGenerating && button.contains(e.target as Node)) {
                  generateContent()
                }
              }}
              onMouseDown={(e) => showTooltip(e, language === 'zh' ? '点击生成关于此主题的结构化心理治疗内容' : 'Click to generate structured therapy content on this topic')}
            >
              {isGenerating ? (language === 'zh' ? '生成中...' : 'Generating...') : t('generateButton')}
            </button>
          </div>
          <p className="subtitle">{t('systemTitle')}</p>
          <p className="description">{language === 'zh' ? '深入冰山之下，探索你的行为阻停系统。' : 'Dive beneath the iceberg to explore your behavioral stopping system.'}</p>
        </header>

        <div className="content-grid">
          <div className="card light-card" onClick={(e) => showTooltip(e, language === 'zh' ? '冰山理论认为，我们能看到的行为只是问题的一小部分，就像冰山露出水面的部分' : 'Iceberg theory suggests that the behavior we can see is just a small part of the problem, like the part of an iceberg above water.')}>
            <h2 className="card-title">{language === 'zh' ? '冰山之上：看得见的表面行为' : 'Above the Iceberg: Visible Behaviors'}</h2>
            <ul className="card-list">
              {contentData.visibleBehaviors.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="card blue-card" onClick={(e) => showTooltip(e, language === 'zh' ? '探索行为背后的深层心理动机，是解决问题的关键' : 'Exploring the deep psychological motivations behind behaviors is key to solving problems.')}>
            <h2 className="card-title">{language === 'zh' ? '冰山之下：深层心理根源' : 'Beneath the Iceberg: Deep Psychological Roots'}</h2>
            <ul className="card-list">
              {contentData.psychologicalRoots.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="card light-card" onClick={(e) => showTooltip(e, language === 'zh' ? '触发器是帮助你开始行动的关键策略，微小的开始往往能带来持续的行动' : 'Triggers are key strategies to help you start taking action; small beginnings often lead to sustained action.')}>
            <h2 className="card-title">{language === 'zh' ? '构建「开始」的触发器' : 'Building "Start" Triggers'}</h2>
            <div className="input-box">{contentData.triggers}</div>
          </div>

          <div className="card blue-card" onClick={(e) => showTooltip(e, language === 'zh' ? '情绪接纳是心理治疗的重要环节，允许自己感受负面情绪而不被其控制' : 'Emotional acceptance is an important part of therapy; allow yourself to feel negative emotions without being controlled by them.')}>
            <h2 className="card-title">{t('emotionAcceptance')}</h2>
            <div className="input-box">{contentData.emotionStrategies}</div>
            <div className="timer-section">
              <span className="timer-text" onClick={(e) => {
                e.stopPropagation()
                showTooltip(e, language === 'zh' ? '5分钟法则：告诉自己只做5分钟，降低开始的心理压力' : '5-minute rule: Tell yourself you only need to do it for 5 minutes to reduce the psychological pressure of starting.')
              }}>5 分钟法则</span>
              <p className="timer-description">Just start for 5 minutes, you can stop anytime.</p>
            </div>
          </div>

          <div className="card light-card" onClick={(e) => showTooltip(e, language === 'zh' ? '建立完成的内在循环能帮助你形成持续的行动习惯' : 'Establishing an internal cycle of completion can help you form sustainable action habits.')}>
            <h2 className="card-title">{language === 'zh' ? '建立「完成」的内在循环' : 'Establishing an Internal "Completion" Cycle'}</h2>
            <div className="input-box">{contentData.completionCycle}</div>
          </div>

          <div className="card blue-card" onClick={(e) => showTooltip(e, language === 'zh' ? '半途而废是常见的挑战，这些方案能帮助你重新回到轨道' : '半途而废是常见的挑战，这些方案能帮助你重新回到轨道')}>
            <h2 className="card-title">{language === 'zh' ? '应对「半途而废」的方案' : 'Solutions for "Giving Up Halfway"'}</h2>
            <ul className="card-list">
              {contentData.halfwaySolutions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="final-rule" onClick={(e) => showTooltip(e, language === 'zh' ? '完美主义往往是行动的障碍，不完美的开始比完美的计划更重要' : 'Perfectionism is often an obstacle to action; an imperfect start is more important than a perfect plan.')}>
          <h2>{language === 'zh' ? '终极法则' : 'Ultimate Rule'}</h2>
          <p>{language === 'zh' ? '不求完美地开始<br/>才能不费力地完成' : 'Don\'t seek a perfect beginning<br/>and you will find an effortless completion'}</p>
          <p className="english-quote">"Don't seek a perfect beginning, and you will find an effortless completion"</p>
        </div>

        <div className="overflow-menu">
          <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
          {isMenuOpen && (
            <div className="menu-content">
              <div className="menu-item">
                <button 
                  className="api-key-button"
                  onClick={() => {
                    setIsApiKeyManagerOpen(true)
                  }}
                >
                  {t('apiKeySettings')}
                </button>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-item">
                <a 
                  href="https://github.com/qcgm1978/psychotherapy/releases" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="api-key-button"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('downloadAndroidApp')}
                </a>
              </div>
              <div className="menu-divider"></div>
              <div className="language-selector">
                <span>{t('languageSettings')}:</span>
                <div className="language-options">
                  <button 
                    className={language === 'en' ? 'active' : ''}
                    onClick={() => {
                      setLanguage('en')
                      setIsMenuOpen(false)
                    }}
                  >
                    {t('englishLanguage')}
                  </button>
                  <button 
                    className={language === 'zh' ? 'active' : ''}
                    onClick={() => {
                      setLanguage('zh')
                      setIsMenuOpen(false)
                    }}
                  >
                    {t('chineseLanguage')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ApiKeyManager
        isOpen={isApiKeyManagerOpen}
        onSave={handleSaveApiKey}
        onClose={() => setIsApiKeyManagerOpen(false)}
      />

      {tooltip.isVisible && (
        <div 
          className="tooltip"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`
          }}
          onClick={hideTooltip}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  )
}

export default App