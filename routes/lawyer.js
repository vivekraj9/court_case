const { ObjectId } = require('mongodb');
const express = require('express');
const router = express.Router();


const { ensureAuthenticated } = require('../config/auth');

//include model
const LawyerDetails = require('../models/LawyerDetails');
const CaseDetails = require('../models/CaseDetails');
const User = require('../models/User');

//dashboard
router.get
    (
        '/dashboard',
        ensureAuthenticated,
        async (req, res) => {
            if (req.user.is_profile_complete === "N")
                res.redirect('/lawyer/profile');
            else
                await CaseDetails.find
                    (
                        {
                            lawyer_id: ObjectId(req.user.id)
                        }
                    ).then
                    (
                        (cases) => {
                            res.render('lawyer_dashboard', { f_name: req.user.fname, cases });
                        }
                    ).catch
                    (
                        (err) => console.log(err)
                    );
        }
    );

//profile
router.get
    (
        '/profile',
        ensureAuthenticated,
        (req, res) => {
            res.render('lawyer_profile', { f_name: req.user.fname });
        }
    );
router.post
    (
        '/profile',
        ensureAuthenticated,
        async (req, res) => {
            //comma separated preferred case types to arr
            const pref_case_types = req.body.pref_case_types;
            const pref_case_types_arr = pref_case_types.split(",");
            pref_case_types_arr.forEach((case_type) => case_type = case_type.trim());

            const new_lawyer_details = new LawyerDetails
                (
                    {
                        lawyer_id: req.user._id,
                        bar_council_id: req.body.bar_id,
                        company_name: req.body.company_name,
                        pref_case_types: pref_case_types_arr,
                        exp_yrs: req.body.exp_yrs,
                        experience: req.body.exp,
                        fees: req.body.fees,
                        fee_descp: req.body.fee_descp,
                        dob: req.body.dob,
                        age: req.body.age,
                        ph_no: req.body.ph_no
                    }
                );

            await new_lawyer_details.save().then
                (
                    async (new_lawyer_obj) => {
                        await User.updateOne
                            (
                                {
                                    _id: req.user._id
                                },
                                {
                                    $set: {
                                        is_profile_complete: "Y"
                                    }
                                }
                            ).then
                            (
                                res.redirect('/lawyer/dashboard')
                            ).catch
                            (
                                (err) => console.log(err)
                            );
                    }
                ).catch
                (
                    (err) => console.log(err)
                );
        }
    );

router.get('/resolved_cases', ensureAuthenticated, async (req, res) => {
    await CaseDetails.find({
        lawyer_id: ObjectId(req.user.id),
        isResolved: "Y"
    }).then(
        (resolvedCases) => {
            res.render('resolved_cases', { f_name: req.user.fname, resolvedCases });
        }
    ).catch(
        (err) => console.log(err)
    );
});

router.post('/resolve_case/:case_id', ensureAuthenticated, async (req, res) => {
    const case_id = req.params.case_id;
    await CaseDetails.updateOne(
        {
            _id: ObjectId(case_id),
            lawyer_id: ObjectId(req.user.id)
        },
        {
            $set: {
                isResolved: "Y"
            }
        }
    ).then(
        res.redirect('/lawyer/dashboard')
    ).catch(
        (err) => console.log(err)
    );
});

//display profile
router.get
    (
        '/display_lawyer_profile/:lawyer_id',
        ensureAuthenticated,
        async (req, res) => {
            await LawyerDetails.find
                (
                    {
                        lawyer_id: ObjectId(req.params.lawyer_id)
                    }
                ).then
                (
                    async (lawyer_details) => {
                        await User.find
                            (
                                {
                                    _id: ObjectId(req.params.lawyer_id)
                                }
                            ).then
                            (
                                (lawyer_bio) => {
                                    const { fname, mname, lname, email } = lawyer_bio[0];
                                    const { company_name, pref_case_types, exp_yrs, experience, fees, fee_descp, dob, age, ph_no } = lawyer_details[0];

                                    res.render('display_lawyer_profile', { fname, mname, lname, email, company_name, pref_case_types, exp_yrs, experience, fees, fee_descp, dob, age, ph_no });
                                }
                            ).catch
                            (
                                (err) => console.log(err)
                            );
                    }
                ).catch
                (
                    (err) => console.log(err)
                );
        }
    );


module.exports = router;


// const { ObjectId } = require('mongodb');
// const express = require('express');
// const router = express.Router();

// const { ensureAuthenticated } = require('../config/auth');

// // Include models
// const LawyerDetails = require('../models/LawyerDetails');
// const CaseDetails = require('../models/CaseDetails');
// const User = require('../models/User');

// // Dashboard
// router.get('/dashboard', ensureAuthenticated, async (req, res) => {
//     if (req.user.is_profile_complete === "N") {
//         res.redirect('/lawyer/profile');
//     } else {
//         try {
//             const cases = await CaseDetails.find({
//                 lawyer_id: ObjectId(req.user.id),
//                 isResolved: "N"
//             });

//             const resolvedCases = await CaseDetails.find({
//                 lawyer_id: ObjectId(req.user.id),
//                 isResolved: "Y"
//             });

//             res.render('lawyer_dashboard', { f_name: req.user.fname, cases, resolvedCases });
//         } catch (err) {
//             console.log(err);
//             res.redirect('/error');
//         }
//     }
// });



// // Display Lawyer Profile
// router.get('/display_lawyer_profile/:lawyer_id', ensureAuthenticated, async (req, res) => {
//     try {
//         const lawyerDetails = await LawyerDetails.findOne({
//             lawyer_id: ObjectId(req.params.lawyer_id)
//         });

//         const lawyerBio = await User.findById(ObjectId(req.params.lawyer_id));

//         if (lawyerDetails && lawyerBio) {
//             const { fname, mname, lname, email } = lawyerBio;
//             const { company_name, pref_case_types, exp_yrs, experience, fees, fee_descp, dob, age, ph_no } = lawyerDetails;

//             res.render('display_lawyer_profile', {
//                 fname,
//                 mname,
//                 lname,
//                 email,
//                 company_name,
//                 pref_case_types,
//                 exp_yrs,
//                 experience,
//                 fees,
//                 fee_descp,
//                 dob,
//                 age,
//                 ph_no
//             });
//         } else {
//             res.redirect('/error');
//         }
//     } catch (err) {
//         console.log(err);
//         res.redirect('/error');
//     }
// });

// // Resolved Cases
// router.get('/resolved_cases', ensureAuthenticated, async (req, res) => {
//     try {
//         const resolvedCases = await CaseDetails.find({
//             lawyer_id: ObjectId(req.user.id),
//             isResolved: "Y"
//         });

//         res.render('resolved_cases', { f_name: req.user.fname, resolvedCases });
//     } catch (err) {
//         console.log(err);
//         res.redirect('/error');
//     }
// });

// // Resolve Case
// router.post('/resolve_case/:case_id', ensureAuthenticated, async (req, res) => {
//     const case_id = req.params.case_id;

//     try {
//         await CaseDetails.updateOne(
//             {
//                 _id: ObjectId(case_id),
//                 lawyer_id: ObjectId(req.user.id)
//             },
//             {
//                 $set: {
//                     isResolved: "Y"
//                 }
//             }
//         );
//         res.redirect('/lawyer/dashboard');
//     } catch (err) {
//         console.log(err);
//         res.redirect('/error');
//     }
// });
// module.exports = router;







