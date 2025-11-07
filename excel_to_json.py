import pandas as pd
import json

# 엑셀 파일 경로
excel_path = "11월_급식표.xlsx"

# 엑셀 불러오기
df = pd.read_excel(excel_path)

# JSON으로 변환
data = []
for _, row in df.iterrows():
    data.append({
        "날짜": str(row["날짜"]).strip(),
        "메뉴": str(row["메뉴"]).strip()
    })

# JSON 파일 저장
json_path = "meals.json"
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ meals.json 파일이 생성되었습니다!")
