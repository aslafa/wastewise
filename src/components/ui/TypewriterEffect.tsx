"use client"

import React, { useState, useEffect } from 'react'

interface TypewriterEffectProps {
  words: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  className?: string
  cursorClassName?: string
}

export function TypewriterEffect({
  words,
  typingSpeed = 90,
  deletingSpeed = 45,
  pauseDuration = 2200,
  className = '',
  cursorClassName = '',
}: TypewriterEffectProps) {
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!words || words.length === 0) return

    const currentWord = words[wordIndex % words.length]

    let timer: NodeJS.Timeout

    if (isDeleting) {
      if (text.length > 0) {
        timer = setTimeout(() => {
          setText(currentWord.substring(0, text.length - 1))
        }, deletingSpeed)
      } else {
        setIsDeleting(false)
        setWordIndex((prev) => (prev + 1) % words.length)
      }
    } else {
      if (text.length < currentWord.length) {
        timer = setTimeout(() => {
          setText(currentWord.substring(0, text.length + 1))
        }, typingSpeed)
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true)
        }, pauseDuration)
      }
    }

    return () => clearTimeout(timer)
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration])

  return (
    <span className={className}>
      <span>{text}</span>
      <span
        className={`inline-block w-[3px] h-[1em] align-middle ml-1 bg-emerald-600 rounded-xs animate-pulse ${cursorClassName}`}
      />
    </span>
  )
}

