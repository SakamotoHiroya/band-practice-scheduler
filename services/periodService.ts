import { supabaseClient } from "@/lib/supabase"
import type { Period } from "@/lib/types"

/**
 * 期間データを取得する
 */
export async function fetchPeriods(): Promise<Period[]> {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("Fetching periods from period_times table...")
    }
    
    const { data, error } = await supabaseClient
      .from("period_times")
      .select("id, start_time, end_time")
      .order("start_time")

    if (process.env.NODE_ENV === "development") {
      console.log("Period fetch result:", { 
        hasData: !!data, 
        dataLength: data?.length ?? 0,
        hasError: !!error,
        errorType: typeof error,
        errorIsNull: error === null,
        errorIsUndefined: error === undefined,
      })
    }

    if (error) {
      // エラーオブジェクトの詳細情報を取得
      const errorInfo: Record<string, unknown> = {
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        errorString: String(error),
      }

      // 列挙可能なプロパティを取得
      try {
        Object.keys(error).forEach((key) => {
          try {
            errorInfo[key] = (error as unknown as Record<string, unknown>)[key]
          } catch (e) {
            errorInfo[`${key}_error`] = String(e)
          }
        })
      } catch (e) {
        errorInfo.keysError = String(e)
      }

      // すべてのプロパティ（列挙不可能なものも含む）を取得
      try {
        const allProps = Object.getOwnPropertyNames(error)
        allProps.forEach((prop) => {
          try {
            const descriptor = Object.getOwnPropertyDescriptor(error, prop)
            if (descriptor) {
              if (descriptor.value !== undefined) {
                errorInfo[`prop_${prop}`] = descriptor.value
              }
              if (descriptor.get) {
                try {
                  errorInfo[`get_${prop}`] = descriptor.get.call(error)
                } catch (e) {
                  errorInfo[`get_${prop}_error`] = String(e)
                }
              }
            }
          } catch (e) {
            errorInfo[`prop_${prop}_error`] = String(e)
          }
        })
      } catch (e) {
        errorInfo.getAllPropsError = String(e)
      }

      // 一般的なエラープロパティを直接試す
      try {
        if ('message' in error) errorInfo.message = (error as { message?: unknown }).message
        if ('code' in error) errorInfo.code = (error as { code?: unknown }).code
        if ('details' in error) errorInfo.details = (error as { details?: unknown }).details
        if ('hint' in error) errorInfo.hint = (error as { hint?: unknown }).hint
      } catch (e) {
        errorInfo.directAccessError = String(e)
      }

      // JSON.stringifyで試す
      try {
        errorInfo.jsonStringified = JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      } catch (e) {
        errorInfo.jsonStringifyError = String(e)
      }

      // エラー情報をログに出力
      console.error("Error fetching periods - Detailed info:", errorInfo)
      console.error("Error fetching periods - Raw error object:", error)
      console.error("Error fetching periods - Error toString:", error.toString?.())
      
      return []
    }

    if (!data) {
      console.warn("No period data returned from database")
      return []
    }

    if (data.length === 0) {
      console.warn("Period times table is empty")
      return []
    }

    return data.map((period) => ({
      id: period.id,
      start: period.start_time,
      end: period.end_time,
    }))
  } catch (err) {
    console.error("Unexpected error fetching periods:", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      fullError: JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
    })
    return []
  }
}

