<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Two Factor Authentication Options
    |--------------------------------------------------------------------------
    |
    | Here you may configure the two factor authentication options for your
    | application. These options are used by Laravel Fortify when verifying
    | two factor authentication codes.
    |
    */

    'two-factor-authentication' => [
        /*
        |--------------------------------------------------------------------------
        | Time Window
        |--------------------------------------------------------------------------
        |
        | This value controls the time window (in 30-second intervals) that will
        | be used when verifying two factor authentication codes. A value of 1
        | means codes from the previous and next 30-second window will also be
        | accepted, providing ±30 seconds of tolerance for time drift.
        |
        | Default: 0 (only current 30-second window)
        | Recommended: 1 (±30 seconds tolerance)
        |
        */

        'window' => env('FORTIFY_2FA_WINDOW', 1),
    ],

];

