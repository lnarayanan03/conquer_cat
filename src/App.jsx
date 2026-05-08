import { useState, useMemo, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./App.css";

function MentorAvatar({ size = 40 }) {
  const s = size + "px"
  return (
    <div style={{
      width:s, height:s, minWidth:s, minHeight:s,
      borderRadius:"50%", flexShrink:0,
      border:"3px solid #f97316",
      background:"#000000",
      boxShadow:"0 0 0 2px rgba(249,115,22,0.2), 0 4px 20px rgba(249,115,22,0.5)",
      overflow:"hidden",
      display:"flex", alignItems:"center", justifyContent:"center",
      position:"relative"
    }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="#000000"/>
        <path d="M20 100 Q20 80 50 78 Q80 80 80 100Z" fill="#f97316" opacity="0.8"/>
        <path d="M25 100 Q25 82 50 80 Q75 82 75 100Z" fill="#f97316" opacity="0.5"/>
        <rect x="43" y="70" width="14" height="12" rx="4" fill="#c68642"/>
        <ellipse cx="50" cy="57" rx="20" ry="23" fill="#c68642"/>
        <ellipse cx="50" cy="38" rx="21" ry="16" fill="#1a0a00"/>
        <path d="M30 43 Q29 57 31 60 Q30 53 32 49Z" fill="#1a0a00"/>
        <path d="M70 43 Q71 57 69 60 Q70 53 68 49Z" fill="#1a0a00"/>
        <ellipse cx="30" cy="57" rx="4" ry="5" fill="#b87333"/>
        <ellipse cx="70" cy="57" rx="4" ry="5" fill="#b87333"/>
        <ellipse cx="41" cy="55" rx="5" ry="4" fill="white"/>
        <ellipse cx="59" cy="55" rx="5" ry="4" fill="white"/>
        <circle cx="42" cy="55" r="3" fill="#1a1a1a"/>
        <circle cx="60" cy="55" r="3" fill="#1a1a1a"/>
        <circle cx="43" cy="54" r="1" fill="white" opacity="0.6"/>
        <circle cx="61" cy="54" r="1" fill="white" opacity="0.6"/>
        <path d="M35 49 Q41 46 47 48" stroke="#1a0a00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M53 48 Q59 46 65 49" stroke="#1a0a00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M50 59 Q47 65 44 66 Q50 68 56 66 Q53 65 50 59Z" fill="#b07030" opacity="0.6"/>
        <path d="M43 72 Q50 73 57 72" stroke="#8b5e3c" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <circle cx="50" cy="50" r="48" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.3"/>
      </svg>
    </div>
  )
}

function UserAvatar({ size=40, gender="male", skinTone="medium", hairStyle="wavy",
  hairColor="black", shirtColor="blue", hasGlasses=false, hasBeard=false }) {
  return (
    <AvatarPreview gender={gender} skinTone={skinTone} hairStyle={hairStyle}
      hairColor={hairColor} shirtColor={shirtColor}
      hasGlasses={hasGlasses} hasBeard={hasBeard} size={size}/>
  )
}

function renderMessage(text) {
  if (!text) return null
  return text.split("\n").map((line, li) => (
    <div key={li} style={{minHeight: line ? "auto" : "8px"}}>
      {line.split(/\*\*(.*?)\*\*/g).map((part, i) => {
        if (i % 2 === 1) {
          return (
            <strong key={i} style={{fontWeight: 700, color: "inherit"}}>{part}</strong>
          )
        }
        return part.split(/\*(.*?)\*/g).map((p, j) =>
          j % 2 === 1
            ? <em key={j} style={{fontStyle: "italic"}}>{p}</em>
            : p
        )
      })}
    </div>
  ))
}

const EXAM = new Date("2026-11-29T00:00:00");
const TOTAL = 200;
const AC = "#f97316";

const toLocalDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
};
const todayKey = () => toLocalDateKey(new Date());
const getDaysToInterview = (dateStr) => {
  if (!dateStr) return 0
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const interview = new Date(dateStr + "T00:00:00")
  interview.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((interview - now) / 86400000))
}
const defaultDay = () => ({ wt:"",st:"",lc:false,ah:"",eh:"",vp:false,vp_count:0,q:0,v:0,l:0,iq:"",n:"" });

const effortScore = (day) => {
  const q = Math.min((+day.q||0)/10, 1) * 25;
  const v = Math.min((+day.v||0)/5, 1) * 15;
  const l = Math.min((+day.l||0)/5, 1) * 15;
  const vp = Math.min((+day.vp_count||0)/1, 1) * 10;
  const hrs = Math.min(((+day.ah||0)+(+day.eh||0))/5, 1) * 20;
  const lc = (day.lc ? 1 : 0) * 10;
  const passage = (day.vp ? 1 : 0) * 5;
  return Math.round(q + v + l + vp + hrs + lc + passage);
};

function Tog({ v, onChange }) {
  return (
    <label className="tog">
      <input type="checkbox" checked={!!v} onChange={e => onChange(e.target.checked)} />
      <span className="tog-track" />
      <span className="tog-thumb" />
    </label>
  );
}

function NavIcon({ id }) {
  const icons = {
    today: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
    progress: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
    calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    chat: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  };
  return icons[id] || null;
}


function TodayPage({ date, d, upd, dl, start, mode, onSave }) {
  const [saved, setSaved] = useState(false);
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning." : h < 17 ? "Good afternoon." : "Good evening.";
  const fmt = new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" });
  const dn = Math.max(1, Math.floor((new Date(date + "T00:00:00") - start) / 86400000) + 1);
  const prepQuotes = [
    "99.9 percentile is not a dream. It is a decision.",
    "Every set you skip today is a percentile you lose in November.",
    "The IIM interview room doesn't care about your excuses.",
    "Vikram cracked CAT at 3am with no internet. What's your excuse?",
    "Your future batchmates at IIM-A are studying right now.",
    "Consistency beats intelligence. Every single time.",
    "The CAT is not testing your knowledge. It is testing your discipline.",
    "One more set. Always one more set.",
  ];
  const interviewQuotes = [
    "The PI is not a test of knowledge. It is a test of who you are.",
    "They have your scores. Now they want your story.",
    "One mock interview a day keeps the rejection away.",
    "Know your SOP better than you know yourself.",
    "The panel can smell nervousness. Practice until it leaves.",
    "Every IIM topper stumbled in a mock before they walked into the real room.",
    "Speak with conviction, not just correctness.",
    "They are not looking for the smartest person. They want the clearest thinker.",
  ];
  const quotes = mode === "interview" ? interviewQuotes : prepQuotes;
  const todayQuote = quotes[new Date().getDate() % quotes.length];

  return (
    <div className="page">
      <div className="page-header">
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
          <div>
            <div className="page-title">{greet}</div>
            <div className="page-sub">{fmt} · Day {dn} of 200</div>
            <div style={{fontSize:12,color:"#f97316",opacity:0.8,fontStyle:"italic",marginTop:8}}>{todayQuote}</div>
          </div>
          <div className="badge"><span>{dl}d left</span></div>
        </div>
      </div>
      <div className="sections">
        <div>
          <div className="sec-label">Vitals</div>
          <div className="card">
            {[
              {lbl:"Wake time", sub:"Goal: 6:00 AM", f:"wt", goal:"06:00"},
              {lbl:"Sleep time", sub:"Goal: by midnight", f:"st", goal:"23:59"}
            ].map(r => (
              <div className="card-row" key={r.f}>
                <div>
                  <div className="row-label">{r.lbl}</div>
                  <div className="row-sub">{r.sub}</div>
                </div>
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  <input
                    type="time"
                    value={d[r.f] || ""}
                    onChange={e => upd(r.f, e.target.value)}
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "#f5f5f7",
                      fontSize: "15px",
                      fontWeight: "500",
                      fontFamily: "inherit",
                      outline: "none",
                      cursor: "pointer",
                      colorScheme: "dark",
                      minWidth: "120px"
                    }}
                  />
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: d[r.f]
                      ? (r.f === "wt"
                          ? (d[r.f] <= "06:00" ? "#30d158" : "#ff453a")
                          : (d[r.f] >= "23:00" || d[r.f] <= "00:30" ? "#30d158" : "#ff453a"))
                      : "#444"
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="sec-label">Sessions</div>
          <div className="card">
            <div className="card-row">
              <div><div className="row-label">Live class</div><div className="row-sub">iQuanta evening</div></div>
              <Tog v={d.lc} onChange={v=>upd("lc",v)} />
            </div>
            {[{lbl:"Afternoon practice",sub:"Target: 2–3 hrs",f:"ah"},{lbl:"Evening session (10–12pm)",sub:"Daily grind block",f:"eh"}].map(r => (
              <div className="card-row" key={r.f}>
                <div><div className="row-label">{r.lbl}</div><div className="row-sub">{r.sub}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <input className="num-input" type="number" step="0.5" min="0" max="12" value={d[r.f]||""} onChange={e=>upd(r.f,e.target.value)} />
                  <span style={{fontSize:11,color:"var(--tt)"}}>hrs</span>
                </div>
              </div>
            ))}
            <div className="card-row">
              <div><div className="row-label">VARC passage</div><div className="row-sub">1 passage minimum</div></div>
              <Tog v={d.vp} onChange={v=>upd("vp",v)} />
            </div>
          </div>
        </div>

        {mode === "interview" ? (
          <div>
            <div className="sec-label">Interview Prep</div>
            <div className="card">
              <div className="card-row">
                <div><div className="row-label">Mock PI done today</div><div className="row-sub">Simulate the real thing</div></div>
                <Tog v={d.mockPI} onChange={v=>upd("mockPI",v)} />
              </div>
              <div className="card-row">
                <div><div className="row-label">WAT practice done</div><div className="row-sub">Written Ability Test</div></div>
                <Tog v={d.watDone} onChange={v=>upd("watDone",v)} />
              </div>
            </div>
            <div style={{marginTop:10}} className="card">
              <textarea className="textarea" placeholder="Topics revised today — acads, current affairs, SOP, hobbies..." value={d.topicsRevised||""} onChange={e=>upd("topicsRevised",e.target.value)} rows={3} />
            </div>
          </div>
        ) : (
          <div>
            <div className="sec-label">Today's work</div>
            <div className="card">
              {[{lbl:"Quant",sub:"Target: 10",f:"q",t:10},{lbl:"VARC sets",sub:"Target: 5",f:"v",t:5},{lbl:"LRDI sets",sub:"Target: 5",f:"l",t:5},{lbl:"VARC Para Reading",sub:"Target: 1 passage",f:"vp_count",t:1}].map(r => {
                const val = +d[r.f] || 0;
                const met = val >= r.t;
                return (
                  <div className="card-row" key={r.f}>
                    <div><div className="row-label">{r.lbl}</div><div className="row-sub">{r.sub}</div></div>
                    <div className="counter">
                      <button className="ctr-btn" onClick={() => upd(r.f, Math.max(0, val-1))}>−</button>
                      <span className="ctr-num" style={{color: met ? "var(--green)" : val > 0 ? AC : "var(--ts)"}}>{val}</span>
                      <button className="ctr-btn" onClick={() => upd(r.f, val+1)}>+</button>
                      <span className="ctr-target">/{r.t}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="sec-label">Notes</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div className="card"><textarea className="textarea" placeholder="iQuanta — topics covered, videos watched..." value={d.iq||""} onChange={e=>upd("iq",e.target.value)} rows={2} /></div>
            <div className="card"><textarea className="textarea" placeholder="Journal — what did you study? focus level? what needs work tomorrow?" value={d.n||""} onChange={e=>upd("n",e.target.value)} rows={3} /></div>
          </div>
        </div>

        <button className={`save-btn${saved?" saved":""}`} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); onSave && onSave(); }}>
          {saved ? "Saved ✓" : "Save Day"}
        </button>
      </div>
    </div>
  );
}

function ProgressPage({ data, totals, dl, dn, start }) {
  const subj = [
    {id:"quant",lbl:"Quant",tar:2000,act:totals.quant},
    {id:"varc",lbl:"VARC",tar:1000,act:totals.varc},
    {id:"lrdi",lbl:"LRDI",tar:1000,act:totals.lrdi},
  ];

  const chartData = useMemo(() => {
    let totalEffort = 0;
    return Array.from({length: TOTAL}, (_, i) => {
      const d = new Date(start); d.setDate(d.getDate() + i);
      const k = toLocalDateKey(d); const e = data[k];
      if (i+1 <= dn) totalEffort += effortScore(e || defaultDay());
      return {
        day:i+1,
        targetLine: ((i+1)/TOTAL) * 100,
        actualLine: i+1 <= dn ? Math.round(totalEffort / (i+1)) : null,
      };
    });
  }, [data, dn, start]);

  const totalH = Object.values(data).reduce((a,d) => a + (+d.ah||0) + (+d.eh||0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Progress</div>
        <div className="page-sub">CAT 2026 · 99.9%ile target</div>
      </div>
      <div className="sections">
        <div className="card" style={{padding:"24px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div className="big-num">{dl}</div>
            <div style={{fontSize:11,color:"var(--tt)",marginTop:6,letterSpacing:"0.06em"}}>DAYS REMAINING</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:18,fontWeight:700,color:"var(--tp)"}}>Day {dn}</div>
            <div style={{fontSize:12,color:"var(--tt)",marginTop:2}}>of 200</div>
          </div>
        </div>

        <div>
          <div className="sec-label">Scoreboard</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {subj.map(s => {
              const pct = Math.min((s.act / s.tar) * 100, 100);
              const nd = Math.ceil((s.tar - s.act) / Math.max(dl, 1));
              return (
                <div key={s.id} className="card" style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:600,color:"var(--tp)"}}>{s.lbl}</span>
                    <span style={{fontSize:13,fontWeight:600,fontVariantNumeric:"tabular-nums",color:"var(--tp)"}}>
                      {s.act.toLocaleString()} <span style={{color:"var(--tt)",fontWeight:400}}>/ {s.tar.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{width:`${pct}%`}} /></div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                    <span style={{fontSize:11,color:"var(--tt)"}}>{pct.toFixed(1)}% complete</span>
                    <span style={{fontSize:11,color: nd <= (s.tar/200) ? "var(--green)" : AC}}>{nd}/day to stay on track</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="sec-label">Journey Score</div>
          <div className="card" style={{padding:"16px 10px 10px"}}>
            <div style={{display:"flex",gap:16,marginBottom:12,paddingLeft:8,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:20,height:2,background:"#f5c518",borderRadius:1}}/><span style={{fontSize:10,color:"var(--tt)"}}>Target</span></div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:20,height:2,background:"#3b82f6",borderRadius:1}}/><span style={{fontSize:10,color:"var(--tt)"}}>Actual</span></div>
              <span style={{fontSize:10,color:"var(--tt)"}}>Above yellow = ahead of schedule</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{top:0,right:12,bottom:0,left:-24}}>
                <CartesianGrid stroke="#1f1f1f" vertical={false} />
                <XAxis dataKey="day" domain={[1, TOTAL]} tick={{fontSize:9,fill:"#6e6e73"}} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{fontSize:9,fill:"#6e6e73"}} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{background:"#111",border:"1px solid #2a2a2a",borderRadius:8,fontSize:11}}
                  labelStyle={{color:"#a1a1a6"}} itemStyle={{color:"#f5f5f7"}}
                  labelFormatter={v => `Day ${v}`}
                  formatter={(v, n) => [`${Math.round(v)}%`, n === "targetLine" ? "Target" : "Actual"]}
                />
                <Line type="monotone" dataKey="targetLine" stroke="#f5c518" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                <Line type="monotone" dataKey="actualLine" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-grid">
          {[
            {n: Object.keys(data).length, l:"Days logged"},
            {n: `${totalH.toFixed(0)}h`, l:"Study hours"},
            {n: (totals.quant+totals.varc+totals.lrdi).toLocaleString(), l:"Total problems", c: AC},
          ].map(s => (
            <div key={s.l} className="stat-card">
              <div className="stat-num" style={s.c ? {color:s.c} : {}}>{s.n}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarPage({ data, sel, onSel, start }) {
  const days = useMemo(() => Array.from({length: TOTAL}, (_, i) => {
    const d = new Date(start); d.setDate(d.getDate() + i);
    const k = toLocalDateKey(d); const e = data[k];
    let status = "";
    if (e) {
      const mq=(+e.q||0)>=10, mv=(+e.v||0)>=5, ml=(+e.l||0)>=5, mvp=(+e.vp_count||0)>=1;
      status = mq && mv && ml && mvp ? "done" : "partial";
    }
    return { k, day:i+1, isToday: k===todayKey(), status };
  }), [data, start]);

  const months = useMemo(() => {
    const labels = [];
    for (let i = 0; i < TOTAL; i += 30) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const label = d.toLocaleDateString("en-IN", { month:"short", year:"numeric" });
      if (!labels.includes(label)) labels.push(label);
    }
    return labels;
  }, [start]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">200 Days</div>
        <div className="page-sub">Every cell is a choice. Leave none empty.</div>
      </div>
      <div className="sections">
        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
          {[{bg:"rgba(249,115,22,.14)",bd:"rgba(249,115,22,.3)",lbl:"All targets met"},
            {bg:"rgba(249,115,22,.05)",bd:"rgba(249,115,22,.15)",lbl:"Partial"},
            {bg:"#111",bd:"#1f1f1f",lbl:"No entry"}].map(l => (
            <div key={l.lbl} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:11,height:11,borderRadius:3,background:l.bg,border:`1px solid ${l.bd}`}} />
              <span style={{fontSize:11,color:"var(--tt)"}}>{l.lbl}</span>
            </div>
          ))}
        </div>
        <div className="cal-grid">
          {days.map(d => (
            <div key={d.k}
              className={`cal-cell ${d.status} ${d.isToday?"today":""} ${d.k===sel?"selected":""}`}
              onClick={() => onSel(d.k)}
              title={`Day ${d.day}`}
            >{d.day}</div>
          ))}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {months.map(m => (
            <span key={m} style={{fontSize:11,color:"var(--tt)",background:"#111",border:"1px solid #1f1f1f",borderRadius:6,padding:"3px 10px"}}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}


function ChatPage({ mentorMessages, setMentorMessages, d, totals, dl, dayNum, mode, userInitials, userName, startDate, interviewDate, catResult, catPercentile, avatarGender, avatarSkin, avatarHair, avatarHairColor, avatarShirt, avatarGlasses, avatarBeard }) {
  const [inp, setInp] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mentorMessages])

  const send = async () => {
    if (!inp.trim() || loading) return
    const q = inp.trim()
    setInp("")
    setMentorMessages(p => [...p, { r:"user", t:q }])
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          daysLeft: dl, totals, dayNum, todayData: d, mode,
          userName: userName || "", startDate: startDate || "", interviewDate: interviewDate || "",
          catResult: catResult || "", catPercentile: catPercentile || "",
          messages: [...mentorMessages, {r:"user",t:q}]
            .map(m => ({role: m.r==="user"?"user":"assistant", content: m.t}))
        })
      })
      if (!res.ok) throw new Error("Server error")
      const data = await res.json()
      const reply = data.content?.[0]?.text || "..."
      setMentorMessages(p => [...p, { r:"ai", t:reply }])
    } catch {
      setMentorMessages(p => [...p, { r:"ai", t:"Connection error. Is the server running?" }])
    }
    setLoading(false)
  }

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      height:"calc(100vh - 0px)", overflow:"hidden"
    }}>
      <div style={{padding:"32px 40px 16px", flexShrink:0,
        borderBottom:"1px solid #1f1f1f"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <MentorAvatar size={64}/>
          <div style={{flex:1}}>
            <div className="page-title" style={{fontSize:24}}>Vikram Anand</div>
            <div style={{fontSize:11,color:"#f97316",marginTop:2,
              letterSpacing:"0.06em"}}>99.99%ILE · IIM-A · YOUR MENTOR</div>
          </div>
          <UserAvatar size={56} gender={avatarGender} skinTone={avatarSkin} hairStyle={avatarHair} hairColor={avatarHairColor} shirtColor={avatarShirt} hasGlasses={avatarGlasses} hasBeard={avatarBeard}/>
        </div>
      </div>

      <div style={{flex:1, overflowY:"auto", padding:"20px 40px",
        display:"flex", flexDirection:"column", gap:12}}>
        {mentorMessages.length === 0 && (
          <div style={{textAlign:"center",color:"#444",fontSize:13,
            marginTop:40,lineHeight:1.8}}>
            Vikram is watching.<br/>
            <span style={{color:"#6e6e73"}}>Say something.</span>
          </div>
        )}
        {mentorMessages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            flexDirection: m.r === "user" ? "row-reverse" : "row",
            alignItems: "flex-end",
            gap: "8px",
            marginBottom: "12px",
            width: "100%",
            boxSizing: "border-box"
          }}>
            {m.r !== "user" && (
              <div style={{flexShrink: 0}}><MentorAvatar size={44}/></div>
            )}
            <div style={{
              maxWidth: "70%",
              padding: "10px 14px",
              borderRadius: m.r === "user"
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              fontSize: "13px",
              lineHeight: "1.65",
              backgroundColor: m.r === "user" ? "#f97316" : "#1c1c1e",
              color: "white",
              border: m.r === "user" ? "none" : "1px solid #2a2a2a",
              wordBreak: "break-word",
              boxSizing: "border-box"
            }}>
              {renderMessage(m.t)}
            </div>
            {m.r === "user" && (
              <div style={{flexShrink: 0}}><UserAvatar size={44} gender={avatarGender} skinTone={avatarSkin} hairStyle={avatarHair} hairColor={avatarHairColor} shirtColor={avatarShirt} hasGlasses={avatarGlasses} hasBeard={avatarBeard}/></div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"4px 0"}}>
            <div style={{flexShrink:0}}><MentorAvatar size={44}/></div>
            <div className="typing"><span/><span/><span/></div>
          </div>
        )}
        <div ref={messagesEndRef}/>
      </div>

      <div style={{
        padding:"16px 40px 24px",
        borderTop:"1px solid #1f1f1f",
        background:"#000",
        flexShrink:0
      }}>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {["Mock Interview","WAT Topic","Doubt"].map(label => (
            <button key={label}
              onClick={() => {
                if(label==="Doubt") return
                setInp(
                  label==="Mock Interview"
                    ? "Start a mock PI interview with me right now"
                    : "Give me a WAT topic and evaluate my response"
                )
              }}
              style={{padding:"5px 12px",borderRadius:20,
                border:"1px solid #2a2a2a",background:"#111",
                color:"#6e6e73",fontSize:11,cursor:"pointer",
                fontFamily:"inherit"}}>
              {label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <textarea
            className="chat-input"
            placeholder="Ask Vikram anything..."
            value={inp}
            onChange={e => setInp(e.target.value)}
            onKeyDown={e => {
              if(e.key==="Enter" && !e.shiftKey){
                e.preventDefault(); send()
              }
            }}
            rows={1}
            style={{flex:1}}
          />
          <button className="send-btn" onClick={send}>↑</button>
        </div>
      </div>
    </div>
  )
}

function FloatingMentor({ daysLeft, totals, dayNum, todayData, mentorMessages, setMentorMessages, mode, userInitials, userName, startDate, interviewDate, catResult, catPercentile, avatarGender, avatarSkin, avatarHair, avatarHairColor, avatarShirt, avatarGlasses, avatarBeard }) {
  const [open, setOpen] = useState(false);
  const [inp, setInp] = useState("");
  const [placeholder, setPlaceholder] = useState("Ask your mentor...");
  const [loading, setLoading] = useState(false);
  const [seenCount, setSeenCount] = useState(mentorMessages.length);
  const [pos, setPos] = useState(() => {
    const saved = localStorage.getItem("mentor_btn_pos")
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 72, y: window.innerHeight - 160 }
  })
  const [dragging, setDragging] = useState(false)
  const btnSize = 56
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const movedRef = useRef(false)
  const posRef = useRef(pos)
  const ref = useRef(null);
  const inputRef = useRef(null);
  const hasUnread = !open && mentorMessages.length > seenCount;

  useEffect(() => { posRef.current = pos }, [pos])
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [mentorMessages, loading]);
  useEffect(() => { if (open) setSeenCount(mentorMessages.length); }, [open, mentorMessages.length]);

  const snapToEdge = (x, y) => {
    const margin = 12
    const W = window.innerWidth
    const H = window.innerHeight
    const dL = x, dR = W - x - btnSize, dT = y, dB = H - y - btnSize
    const minDist = Math.min(dL, dR, dT, dB)
    if (minDist === dL) return { x: margin, y: Math.min(Math.max(y, margin), H - btnSize - margin) }
    if (minDist === dR) return { x: W - btnSize - margin, y: Math.min(Math.max(y, margin), H - btnSize - margin) }
    if (minDist === dT) return { x: Math.min(Math.max(x, margin), W - btnSize - margin), y: margin }
    return { x: Math.min(Math.max(x, margin), W - btnSize - margin), y: H - btnSize - margin }
  }

  const startDrag = (clientX, clientY) => {
    movedRef.current = false
    dragOffsetRef.current = { x: clientX - posRef.current.x, y: clientY - posRef.current.y }
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const { clientX, clientY } = e.touches ? e.touches[0] : e
      movedRef.current = true
      const newX = Math.min(Math.max(clientX - dragOffsetRef.current.x, 0), window.innerWidth - btnSize)
      const newY = Math.min(Math.max(clientY - dragOffsetRef.current.y, 0), window.innerHeight - btnSize)
      setPos({ x: newX, y: newY })
    }
    const onEnd = () => {
      setDragging(false)
      if (movedRef.current) {
        setPos(prev => {
          const snapped = snapToEdge(prev.x, prev.y)
          localStorage.setItem("mentor_btn_pos", JSON.stringify(snapped))
          return snapped
        })
      } else {
        setOpen(p => !p)
      }
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onEnd)
    window.addEventListener("touchmove", onMove, { passive: false })
    window.addEventListener("touchend", onEnd)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onEnd)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend", onEnd)
    }
  }, [dragging])

  const send = async (text) => {
    const q = (text ?? inp).trim();
    if (!q || loading) return;
    setInp("");
    setMentorMessages(p => [...p, {r:"user", t:q}]);
    setLoading(true);
    try {
      const messages = [{ role: "user", content: q }];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, daysLeft, totals, dayNum, todayData, mode, userName: userName || "", startDate: startDate || "", interviewDate: interviewDate || "", catResult: catResult || "", catPercentile: catPercentile || "" })
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setMentorMessages(p => [...p, {r:"ai", t:data.content?.[0]?.text || "I could not get a clean response. Try again."}]);
    } catch {
      setMentorMessages(p => [...p, {r:"ai", t:"Connection error. Check the server."}]);
    }
    setLoading(false);
  };

  const focusDoubt = () => {
    setPlaceholder("Ask your CAT doubt...");
    inputRef.current?.focus();
  };

  const PANEL_W = 360
  const PANEL_H = 500
  const margin = 12

  const panelLeft = (() => {
    const btnRight = pos.x + btnSize
    const spaceRight = window.innerWidth - btnRight - margin
    const spaceLeft = pos.x - margin
    if (spaceRight >= PANEL_W) return btnRight + 8
    if (spaceLeft >= PANEL_W) return pos.x - PANEL_W - 8
    return margin
  })()

  const panelTop = (() => {
    const ideal = pos.y + btnSize / 2 - PANEL_H / 2
    const max = window.innerHeight - PANEL_H - margin
    return Math.min(Math.max(ideal, margin), max)
  })()

  return (
    <>
      {open && (
        <div className="mentor-panel" style={{
          position: "fixed",
          left: panelLeft,
          top: panelTop,
          width: PANEL_W,
          height: PANEL_H,
        }}>
          <div className="mentor-header">
            <div className="mentor-identity">
              <div className="mentor-avatar">
                <MentorAvatar size={56} />
              </div>
              <div>
                <div className="mentor-title">Vikram Anand</div>
                <div className="mentor-sub">99.99%ile · IIM-A · 4× CAT</div>
              </div>
            </div>
            <button className="close-btn" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="messages" ref={ref} style={{padding:"14px",minHeight:0}}>
            {mentorMessages.map((m, i) => (
              <div key={i} style={{
                display: "flex",
                flexDirection: m.r === "user" ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: "8px",
                marginBottom: "12px",
                width: "100%",
                boxSizing: "border-box"
              }}>
                {m.r !== "user" && (
                  <div style={{flexShrink: 0}}><MentorAvatar size={44}/></div>
                )}
                <div style={{
                  maxWidth: "70%",
                  padding: "10px 14px",
                  borderRadius: m.r === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  fontSize: "13px",
                  lineHeight: "1.65",
                  backgroundColor: m.r === "user" ? "#f97316" : "#1c1c1e",
                  color: "white",
                  border: m.r === "user" ? "none" : "1px solid #2a2a2a",
                  wordBreak: "break-word",
                  boxSizing: "border-box"
                }}>
                  {renderMessage(m.t)}
                </div>
                {m.r === "user" && (
                  <div style={{flexShrink: 0}}><UserAvatar size={44} gender={avatarGender} skinTone={avatarSkin} hairStyle={avatarHair} hairColor={avatarHairColor} shirtColor={avatarShirt} hasGlasses={avatarGlasses} hasBeard={avatarBeard}/></div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"4px 0"}}>
                <div style={{flexShrink:0}}><MentorAvatar size={44}/></div>
                <div className="typing"><span /><span /><span /></div>
              </div>
            )}
          </div>
          <div className="chat-input-row" style={{padding:"12px",marginTop:0}}>
            <textarea ref={inputRef} className="chat-input" placeholder={placeholder} value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} rows={1} />
            <button className="send-btn" onClick={() => send()}>↑</button>
          </div>
          <div className="mentor-actions">
            <button onClick={() => send("Start a mock PI interview with me right now")}>Mock Interview</button>
            <button onClick={() => send("Give me a WAT topic and evaluate my response")}>WAT Topic</button>
            <button onClick={focusDoubt}>Doubt</button>
          </div>
        </div>
      )}
      <button
        className="floating-btn"
        aria-label="Open CAT mentor"
        onMouseDown={e => { startDrag(e.clientX, e.clientY); e.preventDefault() }}
        onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: btnSize,
          height: btnSize,
          borderRadius: "50%",
          background: "transparent",
          border: "none",
          padding: 0,
          overflow: "hidden",
          cursor: dragging ? "grabbing" : "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          transition: dragging ? "none" : "left 0.3s cubic-bezier(0.4,0,0.2,1), top 0.3s cubic-bezier(0.4,0,0.2,1)",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <MentorAvatar size={50}/>
        {hasUnread && (
          <span style={{
            position:"absolute", top:0, right:0,
            width:12, height:12, borderRadius:"50%",
            background:"#30d158",
            border:"2px solid #000",
            zIndex:1
          }}/>
        )}
      </button>
    </>
  );
}

function AvatarPreview({ gender="male", skinTone="medium", hairStyle="wavy",
  hairColor="black", shirtColor="orange", hasGlasses=false, hasBeard=false, size=80 }) {

  const skinColors = {light:"#f1c27d", medium:"#c68642", dark:"#8d5524"}
  const hairColors = {black:"#1a0a00", brown:"#6b3a2a", blonde:"#c8a850", grey:"#888888"}
  const shirtColors = {orange:"#f97316",blue:"#3b82f6",green:"#22c55e",purple:"#a855f7",red:"#ef4444",white:"#e5e5e5"}
  const borderColors = {orange:"#f97316",blue:"#3b82f6",green:"#22c55e",purple:"#a855f7",red:"#ef4444",white:"#aaaaaa"}

  const skin = skinColors[skinTone] || "#c68642"
  const hair = hairColors[hairColor] || "#1a0a00"
  const shirt = shirtColors[shirtColor] || "#f97316"
  const border = borderColors[shirtColor] || "#3b82f6"
  const shadow = skinTone==="light" ? "#d4956a" : skinTone==="dark" ? "#6b3d1e" : "#b07030"
  const s = size + "px"

  const renderHair = () => {
    if (gender === "female") {
      if (hairStyle === "bun") return <>
        <ellipse cx="50" cy="36" rx="20" ry="14" fill={hair}/>
        <circle cx="50" cy="22" r="10" fill={hair}/>
        <circle cx="50" cy="22" r="6" fill={hair} opacity="0.7"/>
      </>
      if (hairStyle === "long") return <>
        <ellipse cx="50" cy="35" rx="22" ry="18" fill={hair}/>
        <path d="M28 42 Q22 60 24 85 Q26 70 30 58 Q27 50 28 42Z" fill={hair}/>
        <path d="M72 42 Q78 60 76 85 Q74 70 70 58 Q73 50 72 42Z" fill={hair}/>
        <path d="M24 70 Q22 80 25 88Z" fill={hair}/>
        <path d="M76 70 Q78 80 75 88Z" fill={hair}/>
      </>
      if (hairStyle === "curly") return <>
        <ellipse cx="50" cy="33" rx="23" ry="19" fill={hair}/>
        <circle cx="27" cy="40" r="7" fill={hair}/>
        <circle cx="73" cy="40" r="7" fill={hair}/>
        <circle cx="24" cy="54" r="6" fill={hair}/>
        <circle cx="76" cy="54" r="6" fill={hair}/>
        <circle cx="26" cy="67" r="5" fill={hair}/>
        <circle cx="74" cy="67" r="5" fill={hair}/>
      </>
      if (hairStyle === "short") return <>
        <ellipse cx="50" cy="34" rx="21" ry="15" fill={hair}/>
        <path d="M30 40 Q28 50 30 54Z" fill={hair}/>
        <path d="M70 40 Q72 50 70 54Z" fill={hair}/>
      </>
      return <>
        <ellipse cx="50" cy="34" rx="22" ry="17" fill={hair}/>
        <path d="M28 40 Q24 54 26 68 Q23 58 27 50 Q24 45 28 40Z" fill={hair}/>
        <path d="M72 40 Q76 54 74 68 Q77 58 73 50 Q76 45 72 40Z" fill={hair}/>
        <path d="M26 58 Q22 66 25 74Z" fill={hair}/>
        <path d="M74 58 Q78 66 75 74Z" fill={hair}/>
      </>
    }
    if (hairStyle === "curly") return <>
      <ellipse cx="50" cy="33" rx="22" ry="18" fill={hair}/>
      <circle cx="29" cy="38" r="6" fill={hair}/>
      <circle cx="71" cy="38" r="6" fill={hair}/>
      <circle cx="26" cy="50" r="5" fill={hair}/>
      <circle cx="74" cy="50" r="5" fill={hair}/>
    </>
    if (hairStyle === "wavy") return <>
      <ellipse cx="50" cy="35" rx="22" ry="17" fill={hair}/>
      <path d="M28 42 Q24 53 26 64 Q23 56 27 50 Q24 46 28 42Z" fill={hair}/>
      <path d="M72 42 Q76 53 74 64 Q77 56 73 50 Q76 46 72 42Z" fill={hair}/>
    </>
    return <>
      <ellipse cx="50" cy="34" rx="21" ry="15" fill={hair}/>
      <path d="M30 40 Q29 50 31 54Z" fill={hair}/>
      <path d="M70 40 Q71 50 69 54Z" fill={hair}/>
    </>
  }

  return (
    <div style={{
      width:s, height:s, minWidth:s, minHeight:s,
      borderRadius:"50%", flexShrink:0,
      border:`3px solid ${border}`,
      background:"#0a0a14",
      boxShadow:`0 0 0 2px rgba(0,0,0,0.5), 0 4px 24px ${border}66`,
      overflow:"hidden",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#1a1a2e"/>
            <stop offset="100%" stopColor="#0a0a14"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#bgGrad)"/>
        <path d="M15 100 Q18 78 50 75 Q82 78 85 100Z" fill={shirt} opacity="0.9"/>
        <path d="M22 100 Q25 82 50 79 Q75 82 78 100Z" fill={shirt} opacity="0.6"/>
        <rect x="43" y="68" width="14" height="11" rx="4" fill={skin}/>
        <ellipse cx="50" cy="54" rx="20" ry="22" fill={skin}/>
        {renderHair()}
        <ellipse cx="30" cy="54" rx="4" ry="5" fill={shadow}/>
        <ellipse cx="70" cy="54" rx="4" ry="5" fill={shadow}/>
        <ellipse cx="41" cy="52" rx="5" ry="4" fill="white"/>
        <ellipse cx="59" cy="52" rx="5" ry="4" fill="white"/>
        <circle cx="42" cy="52" r="3" fill="#1a1a2e"/>
        <circle cx="60" cy="52" r="3" fill="#1a1a2e"/>
        <circle cx="43" cy="51" r="1" fill="white" opacity="0.8"/>
        <circle cx="61" cy="51" r="1" fill="white" opacity="0.8"/>
        <path d="M35 46 Q41 43 47 45" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M53 45 Q59 43 65 46" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round"/>
        {hasGlasses && <>
          <path d="M33 48 L33 55 Q33 58 36 58 L46 58 Q49 58 49 55 L49 48 Q49 45 46 45 L36 45 Q33 45 33 48Z"
            fill="rgba(100,150,255,0.12)" stroke="#222" strokeWidth="1.8"/>
          <path d="M51 48 L51 55 Q51 58 54 58 L64 58 Q67 58 67 55 L67 48 Q67 45 64 45 L54 45 Q51 45 51 48Z"
            fill="rgba(100,150,255,0.12)" stroke="#222" strokeWidth="1.8"/>
          <path d="M49 51 L51 51" stroke="#222" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M33 50 L27 48" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M67 50 L73 48" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
        </>}
        <path d="M50 56 Q47 62 44 63 Q50 65 56 63 Q53 62 50 56Z" fill={shadow} opacity="0.5"/>
        {hasBeard && gender==="male" && <>
          <path d="M32 64 Q34 74 40 79 Q50 84 60 79 Q66 74 68 64 Q58 70 50 71 Q42 70 32 64Z" fill={hair}/>
          <path d="M39 62 Q44 65 50 64 Q56 65 61 62 Q56 67 50 66 Q44 67 39 62Z" fill={hair}/>
        </>}
        {gender==="female"
          ? <path d="M44 68 Q50 71 56 68 Q50 73 44 68Z" fill={shadow} opacity="0.8"/>
          : <path d="M43 69 Q50 71 57 69" stroke={shadow} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        }
        <circle cx="50" cy="50" r="48" fill="none" stroke={border} strokeWidth="0.8" opacity="0.4"/>
      </svg>
    </div>
  )
}

function OnboardingScreen({ onStart }) {
  const [name, setName] = useState("")
  const [day, setDay] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("2026")
  const [gender, setGender] = useState("male")
  const [skinTone, setSkinTone] = useState("medium")
  const [hairStyle, setHairStyle] = useState("wavy")
  const [hairColor, setHairColor] = useState("black")
  const [shirtColor, setShirtColor] = useState("orange")
  const [hasGlasses, setHasGlasses] = useState(false)
  const [hasBeard, setHasBeard] = useState(false)

  const months = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"]

  const days = Array.from({length:31},(_,i)=>String(i+1).padStart(2,"0"))

  const getDateString = () => {
    if (!day || !month) return ""
    const m = String(months.indexOf(month)+1).padStart(2,"0")
    return `${year}-${m}-${day}`
  }

  const selectStyle = {
    background:"#111", border:"1px solid #2a2a2a",
    borderRadius:10, padding:"12px 14px", color:"#f5f5f7",
    fontSize:15, outline:"none", fontFamily:"inherit",
    cursor:"pointer", appearance:"none", WebkitAppearance:"none",
    width:"100%"
  }

  const canSubmit = name.trim() && day && month

  return (
    <div style={{position:"fixed",inset:0,background:"#000",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      padding:"40px 24px",fontFamily:"inherit"}}>
      <div style={{fontSize:13,fontWeight:700,letterSpacing:"0.15em",
        color:"#f97316",marginBottom:12}}>CONQUER</div>
      <div style={{fontSize:32,fontWeight:800,color:"#f5f5f7",
        letterSpacing:"-0.03em",marginBottom:8,textAlign:"center",
        lineHeight:1.2}}>200 Days.<br/>One Goal.</div>
      <div style={{fontSize:14,color:"#6e6e73",marginBottom:48,
        textAlign:"center",lineHeight:1.6}}>
        CAT 2026 · 99.9%ile<br/>When does your journey begin?
      </div>
      <div style={{width:"100%",maxWidth:320,display:"flex",
        flexDirection:"column",gap:16}}>
        <div>
          <div style={{fontSize:11,color:"#6e6e73",letterSpacing:"0.08em",
            textTransform:"uppercase",marginBottom:8}}>Your Name</div>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{width:"100%",background:"#111",border:"1px solid #2a2a2a",
              borderRadius:10,padding:"12px 16px",color:"#f5f5f7",
              fontSize:15,outline:"none",fontFamily:"inherit",
              boxSizing:"border-box"}}
          />
        </div>
        <div>
          <div style={{fontSize:11,color:"#6e6e73",letterSpacing:"0.08em",
            textTransform:"uppercase",marginBottom:12}}>Your Look</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>

            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:"#6e6e73",width:70}}>Gender</span>
              <div style={{display:"flex",gap:6}}>
                {["male","female"].map(g => (
                  <button key={g} onClick={() => { setGender(g); if (g==="female") setHasBeard(false) }}
                    style={{padding:"5px 14px",borderRadius:20,
                      background:gender===g?"rgba(249,115,22,0.15)":"#1a1a1a",
                      border:gender===g?"1px solid #f97316":"1px solid #2a2a2a",
                      color:gender===g?"#f97316":"#6e6e73",
                      fontSize:12,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}
                  >{g}</button>
                ))}
              </div>
            </div>

            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:"#6e6e73",width:70}}>Skin</span>
              <div style={{display:"flex",gap:6}}>
                {[{id:"light",color:"#f1c27d"},{id:"medium",color:"#c68642"},{id:"dark",color:"#8d5524"}].map(s => (
                  <button key={s.id} onClick={() => setSkinTone(s.id)}
                    style={{width:28,height:28,borderRadius:"50%",background:s.color,border:"none",
                      cursor:"pointer",outline:skinTone===s.id?"2px solid #f97316":"2px solid transparent",
                      outlineOffset:2}}
                  />
                ))}
              </div>
            </div>

            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:"#6e6e73",width:70}}>Hair</span>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {(gender==="female" ? ["short","wavy","long","curly","bun"] : ["short","wavy","curly"]).map(h => (
                  <button key={h} onClick={() => setHairStyle(h)}
                    style={{padding:"4px 10px",borderRadius:20,
                      background:hairStyle===h?"rgba(249,115,22,0.15)":"#1a1a1a",
                      border:hairStyle===h?"1px solid #f97316":"1px solid #2a2a2a",
                      color:hairStyle===h?"#f97316":"#6e6e73",
                      fontSize:11,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}
                  >{h}</button>
                ))}
              </div>
            </div>

            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:"#6e6e73",width:70}}>Hair color</span>
              <div style={{display:"flex",gap:6}}>
                {[{id:"black",color:"#1a0a00"},{id:"brown",color:"#6b3a2a"},{id:"blonde",color:"#c8a850"},{id:"grey",color:"#888888"}].map(h => (
                  <button key={h.id} onClick={() => setHairColor(h.id)}
                    style={{width:24,height:24,borderRadius:"50%",background:h.color,border:"none",
                      cursor:"pointer",outline:hairColor===h.id?"2px solid #f97316":"2px solid transparent",
                      outlineOffset:2}}
                  />
                ))}
              </div>
            </div>

            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:"#6e6e73",width:70}}>Outfit</span>
              <div style={{display:"flex",gap:6}}>
                {[{id:"orange",color:"#f97316"},{id:"blue",color:"#3b82f6"},{id:"green",color:"#22c55e"},
                  {id:"purple",color:"#a855f7"},{id:"red",color:"#ef4444"},{id:"white",color:"#e5e5e5"}].map(s => (
                  <button key={s.id} onClick={() => setShirtColor(s.id)}
                    style={{width:24,height:24,borderRadius:"50%",background:s.color,border:"none",
                      cursor:"pointer",outline:shirtColor===s.id?"2px solid #f97316":"2px solid transparent",
                      outlineOffset:2}}
                  />
                ))}
              </div>
            </div>

            <div style={{display:"flex",gap:16}}>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={hasGlasses} onChange={e=>setHasGlasses(e.target.checked)} style={{accentColor:"#f97316"}}/>
                <span style={{fontSize:12,color:"#6e6e73"}}>Glasses</span>
              </label>
              {gender==="male" && (
                <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                  <input type="checkbox" checked={hasBeard} onChange={e=>setHasBeard(e.target.checked)} style={{accentColor:"#f97316"}}/>
                  <span style={{fontSize:12,color:"#6e6e73"}}>Beard</span>
                </label>
              )}
            </div>

            <div style={{display:"flex",justifyContent:"center",marginTop:4}}>
              <AvatarPreview gender={gender} skinTone={skinTone} hairStyle={hairStyle}
                hairColor={hairColor} shirtColor={shirtColor}
                hasGlasses={hasGlasses} hasBeard={hasBeard} size={90}/>
            </div>
          </div>
        </div>

        <div>
          <div style={{fontSize:11,color:"#6e6e73",letterSpacing:"0.08em",
            textTransform:"uppercase",marginBottom:8}}>Start Date</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",gap:8}}>
            <select value={day} onChange={e=>setDay(e.target.value)} style={selectStyle}>
              <option value="">DD</option>
              {days.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <select value={month} onChange={e=>setMonth(e.target.value)} style={selectStyle}>
              <option value="">Month</option>
              {months.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
            <select value={year} onChange={e=>setYear(e.target.value)} style={selectStyle}>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            const d = getDateString()
            if (d && name.trim()) {
              localStorage.setItem("cat_avatar_gender", gender)
              localStorage.setItem("cat_avatar_skin", skinTone)
              localStorage.setItem("cat_avatar_hair", hairStyle)
              localStorage.setItem("cat_avatar_hair_color", hairColor)
              localStorage.setItem("cat_avatar_shirt", shirtColor)
              localStorage.setItem("cat_avatar_glasses", String(hasGlasses))
              localStorage.setItem("cat_avatar_beard", String(hasBeard))
              onStart(d, name.trim())
            }
          }}
          disabled={!canSubmit}
          style={{width:"100%",height:52,
            background:canSubmit?"#f97316":"#2a2a2a",
            border:"none",borderRadius:11,color:"white",fontSize:15,
            fontWeight:800,cursor:canSubmit?"pointer":"not-allowed",
            transition:"all 0.2s",fontFamily:"inherit",
            letterSpacing:"0.05em",textTransform:"uppercase"}}>
          Begin the Journey →
        </button>
      </div>
      <div style={{marginTop:48,fontSize:12,color:"#444",
        textAlign:"center",lineHeight:1.8}}>
        "The secret of getting ahead is getting started."<br/>
        <span style={{color:"#6e6e73"}}>— Every IIM topper, ever.</span>
      </div>
    </div>
  )
}

function ResultsScreen({ onConfirm }) {
  const [percentile, setPercentile] = useState("")

  const handleConfirm = () => {
    const p = parseFloat(percentile)
    if (!percentile || isNaN(p)) return
    const success = p >= 99
    localStorage.setItem("cat_result", success ? "cracked" : "missed")
    localStorage.setItem("cat_percentile", percentile)
    onConfirm(success, percentile)
  }

  return (
    <div style={{
      position:"fixed", inset:0, background:"#000",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"40px 24px", fontFamily:"inherit"
    }}>
      <MentorAvatar size={96}/>
      <div style={{
        marginTop:24, fontSize:13, fontWeight:700,
        color:"#f97316", letterSpacing:"0.1em"
      }}>VIKRAM ANAND</div>
      <div style={{
        marginTop:20, fontSize:32, fontWeight:800,
        color:"#f5f5f7", textAlign:"center",
        lineHeight:1.2, letterSpacing:"-0.03em"
      }}>
        CAT results are out.<br/>
        What did you score?
      </div>
      <div style={{
        marginTop:12, fontSize:14, color:"#6e6e73",
        textAlign:"center", lineHeight:1.6, maxWidth:320
      }}>
        Enter your percentile honestly.<br/>
        Vikram already knows.
      </div>

      <div style={{
        marginTop:40, width:"100%", maxWidth:320,
        display:"flex", flexDirection:"column", gap:16
      }}>
        <div>
          <div style={{
            fontSize:11, color:"#6e6e73",
            letterSpacing:"0.08em", textTransform:"uppercase",
            marginBottom:8
          }}>Your Percentile</div>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="e.g. 99.94"
            value={percentile}
            onChange={e => setPercentile(e.target.value)}
            style={{
              width:"100%", background:"#111",
              border:"1px solid #2a2a2a", borderRadius:10,
              padding:"14px 16px", color:"#f5f5f7",
              fontSize:24, fontWeight:700, outline:"none",
              fontFamily:"inherit", textAlign:"center",
              colorScheme:"dark", boxSizing:"border-box"
            }}
          />
        </div>

        {percentile && !isNaN(parseFloat(percentile)) && (
          <div style={{
            padding:"14px 16px",
            background: parseFloat(percentile) >= 99
              ? "rgba(48,209,88,0.1)"
              : "rgba(255,69,58,0.1)",
            border: `1px solid ${parseFloat(percentile) >= 99
              ? "rgba(48,209,88,0.3)"
              : "rgba(255,69,58,0.3)"}`,
            borderRadius:10,
            textAlign:"center"
          }}>
            {parseFloat(percentile) >= 99.5 ? (
              <div>
                <div style={{fontSize:18,fontWeight:700,color:"#30d158"}}>IIM-A range.</div>
                <div style={{fontSize:12,color:"#6e6e73",marginTop:4}}>Interview phase begins. Vikram is ready.</div>
              </div>
            ) : parseFloat(percentile) >= 99 ? (
              <div>
                <div style={{fontSize:18,fontWeight:700,color:"#30d158"}}>IIM calls likely.</div>
                <div style={{fontSize:12,color:"#6e6e73",marginTop:4}}>Prepare for interviews. Every call counts.</div>
              </div>
            ) : parseFloat(percentile) >= 95 ? (
              <div>
                <div style={{fontSize:18,fontWeight:700,color:"#f97316"}}>Good score. Not done yet.</div>
                <div style={{fontSize:12,color:"#6e6e73",marginTop:4}}>New IIMs and top colleges are calling.</div>
              </div>
            ) : (
              <div>
                <div style={{fontSize:18,fontWeight:700,color:"#ff453a"}}>Not what we planned.</div>
                <div style={{fontSize:12,color:"#6e6e73",marginTop:4}}>CAT 2027. We go again. Harder.</div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!percentile || isNaN(parseFloat(percentile))}
          style={{
            width:"100%", height:52,
            background: percentile && !isNaN(parseFloat(percentile))
              ? "#f97316" : "#2a2a2a",
            border:"none", borderRadius:11,
            color:"white", fontSize:15, fontWeight:800,
            cursor: percentile ? "pointer" : "not-allowed",
            fontFamily:"inherit", letterSpacing:"0.05em",
            textTransform:"uppercase"
          }}>
          {parseFloat(percentile) >= 99 ? "Enter Interview Phase →" : "Continue →"}
        </button>
      </div>
    </div>
  )
}

function InterviewOnboarding({ onConfirm }) {
  const [day, setDay] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("2027")

  const months = ["January","February","March","April","May",
    "June","July","August","September","October","November","December"]

  const getDateString = () => {
    if (!day || !month) return ""
    const m = String(months.indexOf(month)+1).padStart(2,"0")
    const d = String(day).padStart(2,"0")
    return `${year}-${m}-${d}`
  }

  const sel = {background:"#111",border:"1px solid #2a2a2a",borderRadius:10,
    padding:"12px 8px",color:"#f5f5f7",fontSize:14,outline:"none",
    fontFamily:"inherit",appearance:"none",WebkitAppearance:"none"}

  return (
    <div style={{position:"fixed",inset:0,background:"#000",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      padding:"40px 24px",fontFamily:"inherit"}}>
      <MentorAvatar size={96}/>
      <div style={{marginTop:20,fontSize:13,color:"#f97316",
        fontWeight:700,letterSpacing:"0.1em"}}>VIKRAM ANAND</div>
      <div style={{marginTop:24,fontSize:28,fontWeight:800,
        color:"#f5f5f7",textAlign:"center",lineHeight:1.3,
        letterSpacing:"-0.03em"}}>
        CAT is done.<br/>Now we go for IIM.
      </div>
      <div style={{marginTop:12,fontSize:14,color:"#6e6e73",
        textAlign:"center",lineHeight:1.6,maxWidth:320}}>
        The interview is the final door.<br/>
        When is your IIM interview?
      </div>
      <div style={{marginTop:40,width:"100%",maxWidth:320,
        display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <div style={{fontSize:11,color:"#6e6e73",letterSpacing:"0.08em",
            textTransform:"uppercase",marginBottom:8}}>Interview Date</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",gap:8}}>
            <select value={day} onChange={e=>setDay(e.target.value)} style={sel}>
              <option value="">DD</option>
              {Array.from({length:31},(_,i)=>String(i+1).padStart(2,"0"))
                .map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <select value={month} onChange={e=>setMonth(e.target.value)} style={sel}>
              <option value="">Month</option>
              {months.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
            <select value={year} onChange={e=>setYear(e.target.value)} style={sel}>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            const d = getDateString()
            if (d) {
              localStorage.setItem("interview_date", d)
              localStorage.setItem("app_mode", "interview")
              onConfirm(d)
            }
          }}
          style={{width:"100%",height:52,
            background:day&&month?"#f97316":"#2a2a2a",
            border:"none",borderRadius:11,color:"white",
            fontSize:15,fontWeight:800,
            cursor:day&&month?"pointer":"not-allowed",
            fontFamily:"inherit",letterSpacing:"0.05em",
            textTransform:"uppercase"}}>
          Lock Interview Date →
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [startDate, setStartDate] = useState(() => {
    const saved = localStorage.getItem("cat_start_date")
    if (!saved || saved.trim() === "" || saved === "null") {
      localStorage.removeItem("cat_start_date")
      return null
    }
    return saved
  });
  const [userName, setUserName] = useState(
    () => localStorage.getItem("cat_user_name") || null
  )
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("app_mode") || "prep"
  })
  const [interviewDate, setInterviewDate] = useState(() => {
    return localStorage.getItem("interview_date") || null
  })
  const [tab, setTab] = useState("today");
  const [data, setData] = useState(() => { try { return JSON.parse(localStorage.getItem("cat_prep_data") || "{}") } catch { return {} } });
  const [sel, setSel] = useState(() => localStorage.getItem("cat_sel_date") || todayKey());
  const [mentorMessages, setMentorMessages] = useState([]);
  const [mentorGreeted, setMentorGreeted] = useState(
    () => localStorage.getItem("mentor_greeted_today") ===
      new Date().toISOString().split("T")[0]
  );
  const [catResult, setCatResult] = useState(() => localStorage.getItem("cat_result") || null)
  const [catPercentile, setCatPercentile] = useState(() => localStorage.getItem("cat_percentile") || null)
  const [userId] = useState(() => {
    let id = localStorage.getItem("conquer_user_id")
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("conquer_user_id", id) }
    return id
  })
  const [synced, setSynced] = useState(false)
  const avatarGender = localStorage.getItem("cat_avatar_gender") || "male"
  const avatarSkin = localStorage.getItem("cat_avatar_skin") || "medium"
  const avatarHair = localStorage.getItem("cat_avatar_hair") || "wavy"
  const avatarHairColor = localStorage.getItem("cat_avatar_hair_color") || "black"
  const avatarShirt = localStorage.getItem("cat_avatar_shirt") || "blue"
  const avatarGlasses = localStorage.getItem("cat_avatar_glasses") === "true"
  const avatarBeard = localStorage.getItem("cat_avatar_beard") === "true"
  const userInitials = userName
    ? userName.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "ME"
  const _today = new Date()
  _today.setHours(0, 0, 0, 0)
  const _exam = new Date("2026-11-29T00:00:00")
  _exam.setHours(0, 0, 0, 0)
  const dl = mode === "interview"
    ? getDaysToInterview(interviewDate)
    : Math.max(0, Math.floor((_exam - _today) / 86400000) - 1)
  const _start = startDate ? new Date(startDate + "T00:00:00") : _today
  _start.setHours(0, 0, 0, 0)
  const dn = Math.max(1, Math.floor((_today - _start) / 86400000) + 1)
  const START = _start
  const totals = useMemo(() => Object.values(data).reduce(
    (a, d) => ({quant:a.quant+(+d.q||0), varc:a.varc+(+d.v||0), lrdi:a.lrdi+(+d.l||0)}),
    {quant:0, varc:0, lrdi:0}
  ), [data]);
  const todayData = data[todayKey()] || defaultDay();

  useEffect(() => { localStorage.setItem("cat_prep_data", JSON.stringify(data)) }, [data]);
  useEffect(() => { localStorage.setItem("cat_sel_date", sel) }, [sel]);
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/log/all/${userId}`)
      .then(r => r.ok ? r.json() : null)
      .then(logs => { if (logs) setData(prev => ({ ...logs, ...prev })); setSynced(true); })
      .catch(() => setSynced(true));
  }, [userId]);
  useEffect(() => {
    if (!startDate || mentorGreeted) return;
    const today = new Date().toISOString().split("T")[0];
    const greet = async () => {
      try {
        const res = await fetch("/api/mentor/greet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ daysLeft: dl, totals, dayNum: dn, todayData, mode, userName: userName || "", startDate: startDate || "", interviewDate: interviewDate || "", catResult: catResult || "", catPercentile: catPercentile || "" })
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setMentorMessages(p => [...p, {r:"ai", t:data.content?.[0]?.text || "Ready when you are. Show up today."}]);
      } catch {
        setMentorMessages(p => [...p, {r:"ai", t:"Ready when you are. Show up today."}]);
      } finally {
        localStorage.setItem("mentor_greeted_today", today);
        setMentorGreeted(true);
      }
    };
    greet();
  }, [startDate, mentorGreeted, dl, totals, dn, todayData]);

  if (!startDate) return <OnboardingScreen onStart={(date, name) => {
    localStorage.setItem("cat_start_date", date)
    localStorage.setItem("cat_user_name", name)
    setStartDate(date)
    setUserName(name)
    fetch("/api/user/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId, name, startDate: date,
        gender: localStorage.getItem("cat_avatar_gender"),
        skinTone: localStorage.getItem("cat_avatar_skin"),
        hairStyle: localStorage.getItem("cat_avatar_hair"),
        hairColor: localStorage.getItem("cat_avatar_hair_color"),
        shirtColor: localStorage.getItem("cat_avatar_shirt"),
        hasGlasses: localStorage.getItem("cat_avatar_glasses") === "true",
        hasBeard: localStorage.getItem("cat_avatar_beard") === "true",
      })
    }).catch(() => {})
  }} />

  const examPassed = new Date() > new Date("2026-11-29T00:00:00")
  const resultsPending = examPassed && !catResult

  if (resultsPending) return (
    <ResultsScreen onConfirm={(success, percentile) => {
      setCatResult(success ? "cracked" : "missed")
      setCatPercentile(percentile)
      if (success) setMode("interview")
    }}/>
  )

  if (examPassed && catResult === "cracked" && mode === "prep") return (
    <InterviewOnboarding onConfirm={(d) => {
      setInterviewDate(d)
      setMode("interview")
      localStorage.setItem("interview_date", d)
      localStorage.setItem("app_mode", "interview")
    }}/>
  )

  const upd = (date, f, v) => setData(p => ({...p, [date]: {...(p[date]||defaultDay()), [f]:v}}));

  const nav = [{id:"today",lbl:"Today"},{id:"progress",lbl:"Progress"},{id:"calendar",lbl:"Calendar"},{id:"chat",lbl:"Mentor"}];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="s-logo">
          <div className="s-title">CONQUER</div>
          <div className="s-sub">{mode === "interview" ? "IIM INTERVIEW" : "CAT 2026 · 99.9%ile"}</div>
        </div>
        <nav className="s-nav">
          {nav.map(n => (
            <button key={n.id} className={`nav-item${tab===n.id?" active":""}`} onClick={() => setTab(n.id)}>
              <NavIcon id={n.id} />
              <span>{n.lbl}</span>
            </button>
          ))}
        </nav>
        <div className="days-pill">
          <div className="dp-num">{dl}</div>
          <div className="dp-lab">{mode === "interview" ? "days to interview" : "days to CAT"}</div>
        </div>
        <div style={{
          padding:"0 14px 8px",
          fontSize:10,
          color:"#444",
          letterSpacing:"0.04em"
        }}>
          {userName && <div style={{color:"#555",marginBottom:2}}>{userName}</div>}
          Started: {new Date(startDate+"T00:00:00")
            .toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("cat_start_date")
            window.location.reload()
          }}
          style={{
            background:"transparent", border:"none",
            color:"#333", fontSize:10, cursor:"pointer",
            padding:"8px 14px", fontFamily:"inherit",
            textAlign:"left", width:"100%"
          }}
        >
          reset start date
        </button>
      </aside>

      <main className="main">
        {tab==="today" && <TodayPage date={sel} d={data[sel]||defaultDay()} upd={(f,v)=>upd(sel,f,v)} dl={dl} start={START} mode={mode} onSave={() => {
          fetch("/api/log/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, date: sel, dayData: data[sel] || defaultDay() })
          }).catch(() => {})
        }} />}
        {tab==="progress" && <ProgressPage data={data} totals={totals} dl={dl} dn={dn} start={START} />}
        {tab==="calendar" && <CalendarPage data={data} sel={sel} onSel={d=>{setSel(d);setTab("today");}} start={START} />}
        {tab==="chat" && <ChatPage mentorMessages={mentorMessages} setMentorMessages={setMentorMessages} d={data[sel]||defaultDay()} totals={totals} dl={dl} dayNum={dn} mode={mode} userInitials={userInitials} userName={userName} startDate={startDate} interviewDate={interviewDate} catResult={catResult} catPercentile={catPercentile} avatarGender={avatarGender} avatarSkin={avatarSkin} avatarHair={avatarHair} avatarHairColor={avatarHairColor} avatarShirt={avatarShirt} avatarGlasses={avatarGlasses} avatarBeard={avatarBeard} />}
      </main>

      <FloatingMentor daysLeft={dl} totals={totals} dayNum={dn} todayData={todayData} mentorMessages={mentorMessages} setMentorMessages={setMentorMessages} mode={mode} userInitials={userInitials} userName={userName} startDate={startDate} interviewDate={interviewDate} catResult={catResult} catPercentile={catPercentile} avatarGender={avatarGender} avatarSkin={avatarSkin} avatarHair={avatarHair} avatarHairColor={avatarHairColor} avatarShirt={avatarShirt} avatarGlasses={avatarGlasses} avatarBeard={avatarBeard} />

      <nav className="bottom-nav">
        <div className="bnav-inner">
          {nav.map(n => (
            <button key={n.id} className={`bnav-item${tab===n.id?" active":""}`} onClick={() => setTab(n.id)}>
              <NavIcon id={n.id} />
              <span>{n.lbl}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
