import { describe, expect, it } from 'vitest'
import { resolveImageUrl } from '../../src/api/client'

describe('resolveImageUrl', () => {
  it('resolves backend-relative image paths against the API base', () => {
    expect(resolveImageUrl('/images/aic/abc/full/200,/0/default.jpg')).toBe(
      'http://localhost:8000/images/aic/abc/full/200,/0/default.jpg',
    )
  })

  it('leaves absolute provider URLs alone', () => {
    expect(resolveImageUrl('https://images.example.org/a.jpg')).toBe('https://images.example.org/a.jpg')
  })
})
