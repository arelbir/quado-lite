# 🧪 Pre-Launch Test Script

**Run this before deploying to production**

**Date:** ___________  
**Tester:** ___________

---

## 🚀 Quick Test (5 Minutes)

### 1. Health Check

```powershell
# Test health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {
#   "status": "healthy",
#   "services": {
#     "database": { "status": "healthy" },
#     "redis": { "status": "healthy" }
#   }
# }
```

**Result:** [ ] PASS / [ ] FAIL

---

### 2. Build Test

```powershell
# Clean build
Remove-Item -Recurse -Force .next
pnpm build

# Should complete without errors
```

**Result:** [ ] PASS / [ ] FAIL  
**Build Time:** ________ seconds

---

### 3. Authentication Test

1. Open http://localhost:3000
2. Login with:
   - Email: `admin@example.com`
   - Password: `Admin123!`
3. Should redirect to `/denetim/audits`

**Result:** [ ] PASS / [ ] FAIL

---

### 4. Database Connection Test

```powershell
# Open Drizzle Studio
pnpm db:studio

# Verify tables exist:
# - User
# - Roles
# - Permissions
# - Audits
# - Findings
# - Actions
# - DOFs
# - WorkflowDefinitions
```

**Result:** [ ] PASS / [ ] FAIL

---

### 5. Environment Variables Test

```powershell
# Check required variables are set
$env:DATABASE_URL          # Should be set
$env:NEXTAUTH_SECRET       # Should be set (32+ chars)
$env:NEXTAUTH_URL          # Should match domain
$env:RESEND_API_KEY        # Should start with re_
$env:UPLOADTHING_SECRET    # Should start with sk_
```

**Result:** [ ] PASS / [ ] FAIL

---

## 🔍 Detailed Test (15 Minutes)

### 6. Create Audit

1. Navigate to `/denetim/audits`
2. Click "Yeni Denetim Oluştur"
3. Select template
4. Fill title: "Test Audit"
5. Click "Oluştur"

**Result:** [ ] PASS / [ ] FAIL  
**Audit ID:** ___________

---

### 7. Answer Questions

1. Open audit detail
2. Answer at least 3 questions
3. Verify score updates

**Result:** [ ] PASS / [ ] FAIL

---

### 8. Create Finding

1. From audit detail, click "Bulgu Ekle"
2. Fill:
   - Description: "Test finding"
   - Severity: High
   - Risk Level: Medium
3. Click "Oluştur"

**Result:** [ ] PASS / [ ] FAIL  
**Finding ID:** ___________

---

### 9. Assign Finding

1. Open finding detail
2. Click "Sorumlu Ata"
3. Select a user
4. Click "Ata"
5. Verify status changes to "Assigned"

**Result:** [ ] PASS / [ ] FAIL

---

### 10. Create Action

1. From finding detail, click "Aksiyon Oluştur"
2. Fill:
   - Details: "Test action"
   - Assign to: Select user
   - Manager: Select manager
   - Due date: 3 days from now
3. Click "Oluştur"

**Result:** [ ] PASS / [ ] FAIL  
**Action ID:** ___________

---

### 11. Complete Action

1. Open action detail
2. Click "Tamamla"
3. Fill completion notes: "Test completion"
4. Click "Kaydet"
5. Verify status changes to "PendingManagerApproval"

**Result:** [ ] PASS / [ ] FAIL

---

### 12. Manager Reject (LOOP TEST!)

1. Login as manager
2. Open action detail
3. Click "Reddet"
4. Fill reason: "Test rejection"
5. Click "Reddet"
6. **CRITICAL:** Verify status returns to "Assigned"
7. Verify rejection reason visible in timeline

**Result:** [ ] PASS / [ ] FAIL  
**Loop Working:** [ ] YES / [ ] NO

---

### 13. Manager Approve

1. Re-complete action
2. Manager clicks "Onayla"
3. Verify status changes to "Completed"

**Result:** [ ] PASS / [ ] FAIL

---

### 14. Timeline Check

1. Open action detail
2. Verify timeline shows:
   - Created event
   - First completion
   - Rejection
   - Second completion
   - Approval

**Result:** [ ] PASS / [ ] FAIL

---

### 15. Permission Check

1. Logout admin
2. Try to access `/admin/users`
3. Should be denied or redirected

**Result:** [ ] PASS / [ ] FAIL

---

### 16. File Upload Test

1. Navigate to any form with file upload
2. Upload a small file (< 1MB)
3. Verify file appears in list

**Result:** [ ] PASS / [ ] FAIL

---

### 17. Email Test (if configured)

1. Create action and assign to user
2. Check user's email
3. Verify notification received

**Result:** [ ] PASS / [ ] FAIL / [ ] SKIPPED

---

## 🔐 Security Checks

### 18. SQL Injection Test

```powershell
# Try malicious input
# Email: admin@example.com' OR '1'='1
# Password: anything

# Should fail gracefully
```

**Result:** [ ] PASS / [ ] FAIL

---

### 19. XSS Test

1. Try to create audit with title:
   ```
   <script>alert('XSS')</script>
   ```
2. Should be escaped/sanitized

**Result:** [ ] PASS / [ ] FAIL

---

### 20. HTTPS Redirect Test (Production only)

```powershell
curl -I http://your-domain.com

# Should redirect to https://
```

**Result:** [ ] PASS / [ ] FAIL / [ ] SKIPPED

---

## ⚡ Performance Checks

### 21. Page Load Test

1. Open DevTools Network tab
2. Hard refresh homepage
3. Check "Load" time

**Result:** [ ] < 2s (PASS) / [ ] > 2s (FAIL)  
**Load Time:** ________ seconds

---

### 22. Database Query Test

1. Open action list page
2. Check DevTools Console for query times
3. Should be < 100ms

**Result:** [ ] PASS / [ ] FAIL  
**Query Time:** ________ ms

---

### 23. Bundle Size Check

```powershell
# Check .next folder size
Get-ChildItem .next -Recurse | Measure-Object -Property Length -Sum

# Should be < 100MB
```

**Result:** [ ] PASS / [ ] FAIL  
**Size:** ________ MB

---

## 🔄 CRON Job Test

### 24. Scheduled Audits CRON

```powershell
# Manually trigger
curl -X POST http://localhost:3000/api/cron/create-scheduled-audits `
  -H "Authorization: Bearer $env:CRON_SECRET"

# Check response
```

**Result:** [ ] PASS / [ ] FAIL

---

### 25. Deadline Check CRON

```powershell
# Manually trigger
curl -X POST http://localhost:3000/api/cron/workflow-deadline-check `
  -H "Authorization: Bearer $env:CRON_SECRET"

# Check response
```

**Result:** [ ] PASS / [ ] FAIL

---

## 📊 Test Summary

**Total Tests:** 25  
**Passed:** _____ / 25  
**Failed:** _____ / 25  
**Skipped:** _____ / 25

**Pass Rate:** _____% 

**Overall Status:** [ ] READY FOR PRODUCTION / [ ] NEEDS FIXES

---

## ❌ Failed Tests (If Any)

| Test # | Test Name | Issue | Severity | Action Required |
|--------|-----------|-------|----------|-----------------|
| | | | Critical/High/Medium/Low | |
| | | | | |
| | | | | |

---

## 📝 Notes

```
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
```

---

## ✅ Approval

**Tested By:** ___________  
**Date:** ___________  
**Time:** ___________

**Approved for Production:** [ ] YES / [ ] NO

**Signature:** ___________

---

## 🚀 Next Steps

If all tests passed:

1. [ ] Review DEPLOYMENT-SUMMARY.md
2. [ ] Complete PRODUCTION-CHECKLIST.md
3. [ ] Deploy to production
4. [ ] Run smoke tests on production
5. [ ] Monitor for 24 hours

If tests failed:

1. [ ] Fix issues
2. [ ] Re-run failed tests
3. [ ] Get approval
4. [ ] Proceed to deployment

---

**Test Script Version:** 1.0  
**Last Updated:** 2025-01-07
