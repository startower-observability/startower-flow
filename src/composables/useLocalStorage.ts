import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
    const storedValue = localStorage.getItem(key)
    let initialValue: T = defaultValue

    if (storedValue) {
        try {
            initialValue = JSON.parse(storedValue)
        } catch {
            console.warn(`Failed to parse localStorage key "${key}"`)
            initialValue = defaultValue
        }
    }

    const data = ref<T>(initialValue) as Ref<T>

    watch(
        data,
        (newValue) => {
            try {
                localStorage.setItem(key, JSON.stringify(newValue))
            } catch (e) {
                console.error(`Failed to save to localStorage key "${key}"`, e)
            }
        },
        { deep: true }
    )

    return data
}

export function clearLocalStorage(key: string): void {
    localStorage.removeItem(key)
}

export function exportToJson<T>(data: T, filename: string): void {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

export function importFromJson<T>(file: File): Promise<T> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (event) => {
            try {
                const result = event.target?.result
                if (typeof result === 'string') {
                    const data = JSON.parse(result) as T
                    resolve(data)
                } else {
                    reject(new Error('Failed to read file'))
                }
            } catch (e) {
                reject(e)
            }
        }

        reader.onerror = () => reject(reader.error)
        reader.readAsText(file)
    })
}
