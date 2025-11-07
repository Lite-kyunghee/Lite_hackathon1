# crawler/suhang_crawler.py
import requests
from bs4 import BeautifulSoup

def get_suhang_data():
    """
    리로스쿨 페이지에서 수행평가 데이터를 로그인된 세션 쿠키로 가져옴
    ※ 반드시 유효한 쿠키(PHPSESSID, riro_token, cookie_token 등)를 사용해야 함
    """

    url = "https://kyungheeboy.riroschool.kr/portfolio.php?db=1551"

    # 사용자 로그인 후 F12 → Network → Request Headers → Cookie 값 복사 후 여기에 입력
    cookies = {
        "PHPSESSID": "hn9jq44c4h1b6hf33cu0j3klhd",
        "riro_token": "VVc1R00wd3hhSFJYUlZwcFVYazVTVkpYV2xSaWJrSXdVVlpOTlZKR2EzcGhNMEpU...",
        "cookie_token": "VDBod2EwNVlWblJQVlRrelZUQm9VMDFXV2s5V2JUQXpUbTEwTWxRd09ETldia3BJ...",
    }

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }

    session = requests.Session()
    session.cookies.update(cookies)
    res = session.get(url, headers=headers)
    res.encoding = "utf-8"

    # 로그인 세션 확인
    if "로그인이 필요합니다" in res.text:
        print("❌ 로그인 세션이 만료되었거나 쿠키가 잘못되었습니다.")
        return []

    soup = BeautifulSoup(res.text, "html.parser")

    # 수행평가 테이블 추출 (예시 구조)
    rows = soup.select("table tbody tr")
    data = []

    for row in rows:
        cols = [td.get_text(strip=True) for td in row.select("td")]
        if len(cols) >= 3:
            data.append({
                "subject": cols[0],
                "desc": cols[1],
                "date": cols[2]
            })

    return data

# 테스트 실행
if __name__ == "__main__":
    print(get_suhang_data())
