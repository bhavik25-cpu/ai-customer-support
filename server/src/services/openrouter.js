export async function askOpenRouter(history) {
  const key=process.env.OPENROUTER_API_KEY;
  if(!key||key.includes('PASTE_YOUR_')){const err=new Error('Add your OpenRouter API key to server/.env and restart the backend.');err.status=503;throw err;}
  const response=await fetch('https://openrouter.ai/api/v1/chat/completions',{
    method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','HTTP-Referer':process.env.OPENROUTER_SITE_URL||'http://localhost:5173','X-Title':process.env.OPENROUTER_APP_NAME||'AI Customer Support'},
    body:JSON.stringify({model:process.env.OPENROUTER_MODEL||'openai/gpt-4o-mini',messages:[{role:'system',content:'You are a friendly, professional customer support assistant. Be concise, practical, and honest. Never invent order details, account information, or company policies.'},...history.slice(-16).map(({role,content})=>({role,content}))],temperature:0.4,max_tokens:900}),
    signal:AbortSignal.timeout(45000)
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok){const err=new Error(data?.error?.message||'OpenRouter request failed ('+response.status+').');err.status=response.status===401?502:response.status;throw err;}
  const answer=data?.choices?.[0]?.message?.content;
  if(typeof answer!=='string'||!answer.trim()){const err=new Error('OpenRouter returned an empty answer.');err.status=502;throw err;}
  return answer.trim();
}
