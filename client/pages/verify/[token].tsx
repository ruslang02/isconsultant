import { useRouter } from "next/router"
import { useEffect } from "react"

export default function Verify() {
  const router = useRouter()
  const { token } = router.query

  useEffect(() => {
    if(!token){
      return
    }

    fetch(`${location.protocol}//${location.host}/api/auth/verify/${token}`).then((response: Response) => {
      if(response.ok) {
        router.replace(`/?verify=success`)
      } else {
        router.replace(`/?verify=failed`)
      }
    })
  }, [token])

  return (<></>)
}