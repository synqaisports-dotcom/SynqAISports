package com.synqai.coach

import android.app.Application
import com.google.android.gms.ads.MobileAds
import com.synqai.coach.data.local.SynqDatabase

class SynqCoachApp : Application() {
    val database: SynqDatabase by lazy { SynqDatabase.get(this) }

    override fun onCreate() {
        super.onCreate()
        MobileAds.initialize(this) {}
    }
}
