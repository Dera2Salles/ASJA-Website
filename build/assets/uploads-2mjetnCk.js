function s(r,i=void 0){if(typeof r!="string"||r.trim()==="")return i;const t=r.trim();return/^(https?:)?\/\//.test(t)||t.startsWith("/")?t:`/storage/${t}`}export{s as u};
