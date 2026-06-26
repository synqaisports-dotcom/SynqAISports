package com.synqai.coach.ui.league

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.synqai.coach.R
import com.synqai.coach.SynqCoachApp
import com.synqai.coach.data.CoachRepository
import com.synqai.coach.databinding.FragmentLeagueBinding
import kotlinx.coroutines.launch

class LeagueFragment : Fragment() {
    private var _binding: FragmentLeagueBinding? = null
    private val binding get() = _binding!!
    private lateinit var repository: CoachRepository
    private var leagueId: Long = 0
    private val adapter = MatchAdapter { match ->
        viewLifecycleOwner.lifecycleScope.launch {
            repository.finishMatch(match.id, match.homeScore + 1, match.awayScore)
            refresh()
        }
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentLeagueBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        repository = CoachRepository((requireActivity().application as SynqCoachApp).database)
        binding.matchList.layoutManager = LinearLayoutManager(requireContext())
        binding.matchList.adapter = adapter

        binding.btnCreateLeague.setOnClickListener {
            val name = binding.inputLeagueName.text?.toString()?.trim().orEmpty()
            val season = binding.inputSeason.text?.toString()?.trim().orEmpty()
            if (name.isEmpty()) {
                Toast.makeText(requireContext(), R.string.league_name_required, Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewLifecycleOwner.lifecycleScope.launch {
                leagueId = repository.createLeague(name, season.ifEmpty { "2025/26" })
                refresh()
            }
        }

        binding.btnAddMatch.setOnClickListener {
            if (leagueId == 0L) {
                Toast.makeText(requireContext(), R.string.league_create_first, Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val opponent = binding.inputOpponent.text?.toString()?.trim().orEmpty()
            if (opponent.isEmpty()) return@setOnClickListener
            viewLifecycleOwner.lifecycleScope.launch {
                repository.addMatch(leagueId, opponent, binding.checkHome.isChecked, System.currentTimeMillis())
                binding.inputOpponent.text?.clear()
                refresh()
            }
        }

        binding.btnResetSeason.setOnClickListener {
            AlertDialog.Builder(requireContext())
                .setTitle(R.string.league_reset_title)
                .setMessage(R.string.league_reset_message)
                .setPositiveButton(R.string.confirm) { _, _ ->
                    viewLifecycleOwner.lifecycleScope.launch {
                        repository.resetSeason()
                        leagueId = 0
                        adapter.submit(emptyList())
                    }
                }
                .setNegativeButton(R.string.cancel, null)
                .show()
        }

        viewLifecycleOwner.lifecycleScope.launch {
            val league = repository.getActiveLeague()
            if (league != null) {
                leagueId = league.id
                binding.inputLeagueName.setText(league.name)
                binding.inputSeason.setText(league.seasonLabel)
            }
            refresh()
        }
    }

    private fun refresh() {
        if (leagueId == 0L) return
        viewLifecycleOwner.lifecycleScope.launch {
            adapter.submit(repository.getMatches(leagueId))
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
